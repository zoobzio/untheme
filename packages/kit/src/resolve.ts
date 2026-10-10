import type {
  Document,
  GenerateOptions,
  Kit,
  KitConfig,
  Preset,
} from "./types";

import { resolve } from "node:path";

import { keys } from "objectively";

import { assemble } from "./assemble";
import { buildLayers } from "./layers";
import { OUT_DIR } from "./constant";
import { skeleton } from "./contexts";
import { portable, readPreset } from "./preset";
import {
  designate,
  isPreset,
  loader,
  locate,
  normalize,
  packageName,
} from "./source";
import { tailor } from "./tailor";
import { toDocument } from "./util";
import { validate } from "./validate";

/**
 * Validates a config and resolves it into a {@link Kit}. The function reads the
 * source, or the preset that it names. It merges `extend` onto the document and
 * tailors it to the `modifiers` of the config. It reads every document that the
 * resolver references with `@terrazzo/parser`, with `alphabetize` off. It
 * converts the base theme and the boot selection, validates both with the
 * untheme schema, and verifies the result against the Terrazzo resolution.
 * Then it builds the layers: the base, the inherited layers, and the layers of
 * the config. In a named package, it also makes the portable resolver document.
 * This is the only step that reads documents. {@link generate} turns the
 * result into files.
 *
 * @param config - The kit config.
 * @param options - The project root and I/O hooks.
 * @throws InvalidConfigError when the config breaks a rule. The function throws
 * before it reads a document.
 * @throws InvalidLayerError when a layer violates the contract.
 * @throws Error when the layers directory is not local or cannot be listed, or
 * when a preset manifest or one of its layers is malformed.
 */
export const resolveKit = async (
  config: KitConfig,
  options: GenerateOptions = {},
): Promise<Kit> => {
  validate(config);
  const root = resolve(options.cwd ?? process.cwd());
  const files = loader(root, options.req, options.logger);
  const { base, load, documents } = files;

  let url = designate(locate(config.source, base));
  let inherited: Preset["layers"] = [];
  if (isPreset(url)) {
    const preset = await readPreset(url, load);
    url = preset.resolver;
    inherited = preset.layers;
  }

  const authored = await load(url, base);
  let tailored: Document | undefined;
  if (
    config.extend !== undefined ||
    (config.modifiers && keys(config.modifiers).length > 0)
  ) {
    tailored = tailor(authored, config, base);
  }
  const parsed = await files.parse([
    { filename: url, src: tailored ?? authored },
  ]);
  const { theme, input, manifest } = assemble(parsed, config);

  // The base as authored, so the base layer can hold what the config changed.
  let pristine: Record<string, Record<string, unknown>> | undefined;
  if (tailored !== undefined) {
    const upstream = await files.parse([{ filename: url, src: authored }]);
    pristine = skeleton(upstream.resolver, upstream.tokens).tokens;
  }

  const layers = await buildLayers(
    {
      configured: config.layers,
      inherited,
      pristine,
      description: parsed.resolver?.source.description,
    },
    theme,
    files,
  );

  let resolver: Document | undefined;
  const name = await packageName(root);
  const document = tailored ?? toDocument(authored);
  if (name !== undefined && document !== undefined) {
    resolver = portable({ ...document, name: theme.name }, url, base, name);
  }

  return {
    theme,
    input,
    manifest,
    layers,
    resolver,
    outDir: normalize(config.outDir ?? OUT_DIR),
    documents,
  };
};
