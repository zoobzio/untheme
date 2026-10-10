import type { Logger, ParseOptions, ParseResult } from "@terrazzo/parser";
import type { Req } from "./types";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, posix, win32 } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { defineConfig, parse } from "@terrazzo/parser";

import { NPM, PRESET } from "./constant";
import { toDocument } from "./util";

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
 * Strips every leading and trailing slash from a string. A loop, rather than a
 * regular expression, keeps the work linear on a long run of slashes.
 */
export const unslash = (text: string): string => {
  let start = 0;
  let end = text.length;
  while (start < end && text[start] === "/") {
    start += 1;
  }
  while (end > start && text[end - 1] === "/") {
    end -= 1;
  }
  return text.slice(start, end);
};

/** Returns the URL with one trailing slash, so a relative path resolves below it. */
export const slashed = (url: URL): URL => {
  let end = url.href.length;
  while (end > 0 && url.href[end - 1] === "/") {
    end -= 1;
  }
  return new URL(`${url.href.slice(0, end)}/`);
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
  const segments = unslash(url.pathname).split("/");
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

/** The documents of one parse, as Terrazzo takes them. */
export type Inputs = Parameters<typeof parse>[0];

/**
 * Resolves an `npm:/` URL to the file that it names. The function uses Node
 * package resolution from the project root. `npm:/@untheme/aurora/src/tokens/space.json`
 * resolves as the project would import
 * `@untheme/aurora/src/tokens/space.json`. The package must export the file. The
 * URL fragment, a JSON pointer, is separate from the file path.
 *
 * @param src - The `npm:/` URL.
 * @param root - The project root that packages resolve from.
 */
export const installed = (src: URL, root: string): string => {
  const specifier = decodeURIComponent(src.pathname).replace(/^\/+/, "");
  try {
    return createRequire(join(root, "package.json")).resolve(specifier);
  } catch (error) {
    throw new Error(
      `@untheme/kit: cannot resolve ${src.href} — "${specifier}" is not a file an installed package exports (from ${root})`,
      { cause: error },
    );
  }
};

/**
 * The loader of one build. It reads and parses every document with the
 * settings of the build, and it records the local files that it has read.
 */
export interface Loader {
  /** The project root as a directory URL. Relative sources resolve against it. */
  base: URL;

  /** Reads one document. The kit hands it to the parser as `req`. */
  load: Req;

  /**
   * The absolute path of every local file read, in read order. The layer
   * builder adds the layers directory when the config names one.
   */
  documents: string[];

  /** Adds a local path to `documents`, once. */
  track: (path: string) => void;

  /**
   * Parses documents with `@terrazzo/parser`. The parse reads through `load`,
   * reports through the logger of the build, skips the lint, and keeps the
   * authored order. `options` adds to or overrides these settings.
   */
  parse: (
    inputs: Inputs,
    options?: Partial<ParseOptions>,
  ) => Promise<ParseResult>;
}

/**
 * Makes the loader of a build. `npm:` URLs resolve from the installed packages
 * of the project and are read from disk. All other URLs go to the `req` of the
 * caller, or to {@link request}. The loader records each local file once in
 * `documents`.
 *
 * @param root - The project root that `npm:` references resolve from.
 * @param req - The caller's loader for `file:` and remote documents.
 * @param logger - The Terrazzo logger that every parse reports through.
 */
export const loader = (root: string, req?: Req, logger?: Logger): Loader => {
  const base = directory(root);
  const documents: string[] = [];

  const track = (path: string): void => {
    if (!documents.includes(path)) {
      documents.push(path);
    }
  };

  const load: Req = async (src, origin) => {
    if (src.protocol === NPM) {
      const path = installed(src, root);
      track(path);
      return readFile(path, "utf8");
    }
    if (src.protocol === "file:") {
      track(fileURLToPath(src));
    }
    if (req) {
      return req(src, origin);
    }
    return request(src);
  };

  const settings: ParseOptions = {
    config: defineConfig({ alphabetize: false }, { cwd: base }),
    req: load,
    logger,
    skipLint: true,
  };

  return {
    base,
    load,
    documents,
    track,
    parse: (inputs, options) => parse(inputs, { ...settings, ...options }),
  };
};
