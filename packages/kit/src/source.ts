import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

/**
 * Resolves a source designator to a URL. An absolute URL (`https:`, `file:`,
 * `npm:`) stays as it is. A plain path resolves against `base`.
 */
export const locate = (source: string | URL, base: URL): URL => {
  if (typeof source === "string") {
    return new URL(source, base);
  }
  return source;
};

/**
 * The default document loader. It reads `file:` URLs from the filesystem and
 * uses `fetch` for all other URLs. Authenticated sources use a `req` that the
 * caller supplies.
 */
export const request = async (src: URL): Promise<string> => {
  if (src.protocol === "file:") {
    return readFile(src, "utf8");
  }
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(
      `@untheme/kit: fetching ${src.href} failed with ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
};

/**
 * Makes a file URL with a trailing slash from a directory path. Relative source
 * paths resolve against it.
 */
export const directory = (path: string): URL => {
  return new URL(`${pathToFileURL(path).href}/`);
};
