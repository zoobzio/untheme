import type { GenerateOptions, Kit, KitConfig } from "./types";

import { resolve } from "node:path";

import { defineConfig, parse } from "@terrazzo/parser";

import { assemble } from "./assemble";
import { OUT_DIR } from "./constant";
import { loader } from "./loader";
import { normalize } from "./path";
import { directory, locate } from "./source";
import { tailor } from "./tailor";
import { validate } from "./validate";

/**
 * Validates a config and resolves it into a {@link Kit}. The function reads the
 * resolver document and tailors it to the `modifiers` of the config. It reads
 * every document that the resolver references with `@terrazzo/parser`, with
 * `alphabetize` off. It converts the base theme and the boot selection. The base
 * theme has the tokens, the modifier contexts, and the order. It validates both
 * with the untheme schema and verifies the result against the Terrazzo
 * resolution. This is the only step that reads documents. {@link generate} turns
 * the result into files.
 *
 * @param config - The kit config.
 * @param options - The project root and I/O hooks.
 * @throws InvalidConfigError when the config breaks a rule. The function throws
 * before it reads a document.
 */
export const resolveKit = async (
  config: KitConfig,
  options: GenerateOptions = {},
): Promise<Kit> => {
  validate(config);
  const root = resolve(options.cwd ?? process.cwd());
  const base = directory(root);
  const url = locate(config.source, base);

  const { load, documents } = loader(root, options.req);
  let src = await load(url, base);
  if (config.modifiers && Object.keys(config.modifiers).length > 0) {
    src = tailor(src, config.modifiers, base);
  }
  const parsed = await parse([{ filename: url, src }], {
    config: defineConfig({ alphabetize: false }, { cwd: base }),
    req: load,
    logger: options.logger,
    skipLint: true,
  });

  const { theme, input, manifest } = assemble(parsed, config);
  return {
    theme,
    input,
    manifest,
    outDir: normalize(config.outDir ?? OUT_DIR),
    documents,
  };
};
