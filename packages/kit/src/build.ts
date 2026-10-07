import { resolve } from "node:path";

import type { BuildOptions, Output } from "./types";
import { FILENAME } from "./constant";
import { generate } from "./generate";
import { loadConfig } from "./load";
import { writeOutput } from "./write";

/**
 * Runs the whole build. The function loads the config, generates the output, and
 * writes the output directory. The CLI runs this function.
 *
 * @param options - The root, the config path, and the I/O hooks.
 */
export const build = async (options: BuildOptions = {}): Promise<Output> => {
  const { root: rootOption, config: configOption, ...hooks } = options;
  const root = resolve(rootOption ?? process.cwd());
  const config = await loadConfig(resolve(root, configOption ?? FILENAME));
  const output = await generate(config, { ...hooks, cwd: root });
  await writeOutput(output, root);
  return output;
};
