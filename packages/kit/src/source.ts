import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { NPM, PRESET } from "./constant";
import { toDocument } from "./util";

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

/** Returns the URL with one trailing slash, so a relative path resolves below it. */
export const slashed = (url: URL): URL => {
  return new URL(`${url.href.replace(/\/+$/, "")}/`);
};

/**
 * Makes a file URL with a trailing slash from a directory path. Relative source
 * paths resolve against it.
 */
export const directory = (path: string): URL => {
  return slashed(pathToFileURL(path));
};

/** Whether an `npm:/` URL names a package and no path in it. */
export const bare = (url: URL): boolean => {
  if (url.protocol !== NPM) {
    return false;
  }
  const segments = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (segments[0]?.startsWith("@")) {
    return segments.length === 2;
  }
  return segments.length === 1 && segments[0] !== "";
};

/** Returns the URL to read for a source. A bare package reads its preset manifest. */
export const designate = (url: URL): URL => {
  if (!bare(url)) {
    return url;
  }
  return new URL(`${slashed(url).href}${PRESET}`);
};

/** Whether a URL names a preset manifest. */
export const isPreset = (url: URL): boolean => {
  return url.pathname.endsWith(`/${PRESET}`);
};

/** The `name` in the `package.json` of a project root, when it has one. */
export const packageName = async (
  root: string,
): Promise<string | undefined> => {
  let text: string;
  try {
    text = await readFile(join(root, "package.json"), "utf8");
  } catch {
    // No package: the build is not a preset.
    return undefined;
  }
  const manifest = toDocument(text);
  return typeof manifest?.name === "string" ? manifest.name : undefined;
};
