import { posix, win32 } from "node:path";

/**
 * Normalizes an authored relative path to posix form. The function unifies
 * separators and drops `./` segments and a trailing slash.
 *
 * @param path - The authored path.
 */
export const normalize = (path: string): string => {
  return posix.normalize(path.replaceAll("\\", "/")).replace(/\/$/, "");
};

/**
 * Whether a normalized path is a relative path below its directory. An absolute
 * path, the directory itself, and a path that reaches a parent return `false`.
 * The kit checks this wherever it writes or removes files.
 *
 * @param path - A path that {@link normalize} returned.
 */
export const inside = (path: string): boolean => {
  if (posix.isAbsolute(path) || win32.isAbsolute(path)) {
    return false;
  }
  return path !== "." && path !== ".." && !path.startsWith("../");
};
