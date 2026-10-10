import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { record } from "objectively";

import { NPM, PRESET } from "./constant";

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
  return new URL(`${url.href.replace(/\/+$/, "")}/${PRESET}`);
};

/** Whether a URL names a preset manifest. */
export const isPreset = (url: URL): boolean => {
  return url.pathname.endsWith(`/${PRESET}`);
};

/** The `name` in the `package.json` of a project root, when it has one. */
export const packageName = async (
  root: string,
): Promise<string | undefined> => {
  try {
    const manifest: unknown = JSON.parse(
      await readFile(join(root, "package.json"), "utf8"),
    );
    if (record(manifest) && typeof manifest.name === "string") {
      return manifest.name;
    }
  } catch {
    // No package: the build is not a preset.
  }
  return undefined;
};
