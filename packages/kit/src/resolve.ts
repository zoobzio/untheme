import type { GenerateOptions, Kit, KitConfig, Preset } from "./types";

import { resolve } from "node:path";

import { defineConfig, parse } from "@terrazzo/parser";
import { keys, record } from "objectively";

import { assemble } from "./assemble";
import { buildLayers } from "./layers";
import { OUT_DIR } from "./constant";
import { skeleton } from "./contexts";
import { loader } from "./loader";
import { normalize } from "./path";
import { portable, readPreset } from "./preset";
import { designate, directory, isPreset, locate, packageName } from "./source";
import { tailor } from "./tailor";
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
  const base = directory(root);
  const files = loader(root, options.req);
  const { load, documents } = files;

  let url = designate(locate(config.source, base));
  let inherited: Preset["layers"] = [];
  if (isPreset(url)) {
    const preset = await readPreset(url, load);
    url = preset.resolver;
    inherited = preset.layers;
  }

  const authored = await load(url, base);
  let src = authored;
  if (
    config.extend !== undefined ||
    (config.modifiers && keys(config.modifiers).length > 0)
  ) {
    src = tailor(src, config, base);
  }
  const settings = {
    config: defineConfig({ alphabetize: false }, { cwd: base }),
    req: load,
    logger: options.logger,
    skipLint: true,
  };
  const parsed = await parse([{ filename: url, src }], settings);
  const { theme, input, manifest } = assemble(parsed, config);

  // The base as authored, so the base layer can hold what the config changed.
  let pristine: Record<string, Record<string, unknown>> | undefined;
  if (src !== authored) {
    const upstream = await parse([{ filename: url, src: authored }], settings);
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
    base,
    files,
    options.logger,
  );

  let resolver: Record<string, unknown> | undefined;
  const name = await packageName(root);
  const document: unknown = JSON.parse(src);
  if (name !== undefined && record(document)) {
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
