import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

/**
 * Resolves a source designator to a URL: absolute URLs (`https:`, `file:`,
 * `npm:`) pass through, a plain path lands under `base`.
 */
export const locate = (source: string | URL, base: URL): URL => {
  if (typeof source === "string") {
    return new URL(source, base);
  }
  return source;
};

/**
 * The default document loader: the filesystem for `file:` URLs, plain `fetch`
 * for everything else. Carries no credentials — authenticated sources go
 * through a caller-supplied `req` instead.
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
 * A directory as a trailing-slash file URL — the base that relative source
 * paths resolve against.
 */
export const directory = (path: string): URL => {
  return new URL(`${pathToFileURL(path).href}/`);
};
