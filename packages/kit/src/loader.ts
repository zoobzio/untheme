import type { Logger, ParseOptions, ParseResult } from "@terrazzo/parser";
import type { Req } from "./types";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, parse } from "@terrazzo/parser";

import { NPM } from "./constant";
import { directory, request } from "./source";

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
