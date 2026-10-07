import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import type { Output } from "./types";
import { readManifest, writeManifest } from "./manifest";

/**
 * Writes the files of an output under `<root>/<outDir>`. The kit overwrites its
 * own files in place. The function removes a file when the manifest in the
 * directory lists it and the output omits it. The directory can hold authored
 * source, such as `src/untheme`. The function removes only listed files.
 *
 * @param output - The output to write.
 * @param root - The project root.
 */
export const writeOutput = async (
  output: Output,
  root: string,
): Promise<void> => {
  const dir = resolve(root, output.outDir);
  await mkdir(dir, { recursive: true });

  const produced = output.files.map((file) => file.path);
  for (const path of await readManifest(dir)) {
    if (!produced.includes(path)) {
      await rm(join(dir, path), { force: true });
    }
  }

  for (const file of output.files) {
    const target = join(dir, file.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.contents);
  }
  await writeManifest(dir, produced);
};
