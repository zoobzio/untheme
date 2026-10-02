import type { GenerateOptions, Kit, KitConfig } from "./types";

import { resolve } from "node:path";

import { defineConfig, parse } from "@terrazzo/parser";

import { assemble } from "./assemble";
import { OUT_DIR } from "./constant";
import { loader } from "./loader";
import { normalize } from "./path";
import { directory, locate } from "./source";
import { validate } from "./validate";

/**
 * Checks a config and resolves it into a {@link Kit}: reads the resolver
 * document and every document it references through `@terrazzo/parser`,
 * converts the base theme — tokens, modifier contexts, order — and the boot
 * selection, validates both against untheme's schema, and proves the result
 * against Terrazzo's own resolution. The only step that reads documents. No
 * filesystem writes — {@link generate} turns the result into files; a caller
 * that wants the documents themselves stops here.
 *
 * @param config - The kit config.
 * @param options - The project root and I/O hooks.
 * @throws InvalidConfigError when the config breaks a rule, before reading.
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
  const parsed = await parse([{ filename: url, src: await load(url, base) }], {
    config: defineConfig({}, { cwd: base }),
    req: load,
    logger: options.logger,
    skipLint: true,
  });

  const { theme, input } = assemble(parsed, config);
  return {
    theme,
    input,
    outDir: normalize(config.outDir ?? OUT_DIR),
    documents,
  };
};
