import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { record } from "objectively";

import { MANIFEST } from "./constant";
import { inside, normalize } from "./path";

/**
 * Reads the paths that the manifest file in an output directory lists. The
 * function returns no paths when the file is missing or unreadable. The function
 * drops an entry that reaches outside the directory.
 *
 * @param dir - The absolute output directory.
 */
export const readManifest = async (dir: string): Promise<string[]> => {
  let files: unknown;
  try {
    const manifest: unknown = JSON.parse(
      await readFile(join(dir, MANIFEST), "utf8"),
    );
    if (record(manifest)) {
      files = manifest.files;
    }
  } catch {
    return [];
  }
  if (!Array.isArray(files)) {
    return [];
  }
  return files.filter((path): path is string => {
    return typeof path === "string" && inside(normalize(path));
  });
};

/**
 * Records the paths that a write produced in the manifest file.
 *
 * @param dir - The absolute output directory.
 * @param files - The written paths, relative to `dir`.
 */
export const writeManifest = async (
  dir: string,
  files: string[],
): Promise<void> => {
  await writeFile(
    join(dir, MANIFEST),
    `${JSON.stringify({ files }, null, 2)}\n`,
  );
};
