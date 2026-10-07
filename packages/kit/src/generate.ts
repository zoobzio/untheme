import type { GenerateOptions, KitConfig, Output } from "./types";
import { emit } from "./emit";
import { resolveKit } from "./resolve";

/**
 * Generates the contract and key modules from a kit config. The function
 * validates and resolves the config with {@link resolveKit}, then emits the
 * modules for `outDir`. An app imports the modules by relative path. A published
 * package points its `exports` at them.
 *
 * @param config - The kit config.
 * @param options - The project root and I/O hooks.
 * @throws InvalidConfigError when the config breaks a rule. The function throws
 * before it reads a document.
 */
export const generate = async (
  config: KitConfig,
  options: GenerateOptions = {},
): Promise<Output> => {
  const kit = await resolveKit(config, options);
  return { outDir: kit.outDir, files: emit(kit) };
};
