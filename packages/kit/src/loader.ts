import type { Req } from "./types";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { NPM } from "./constant";
import { request } from "./source";

/**
 * Resolves an `npm:/` URL to the file it names, through Node package
 * resolution from the project root: `npm:/@untheme/aurora/src/tokens/space.json`
 * is `@untheme/aurora/src/tokens/space.json` as the project would import it, so
 * the package must export the file. The URL's fragment (a JSON pointer) is
 * not part of the file.
 *
 * @param src - The `npm:/` URL.
 * @param root - The project root packages resolve from.
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
 * The loader of one build: the function every document is read through, and
 * the local files it has read so far.
 */
export interface Loader {
  /** Reads one document. Handed to the parser as its `req`. */
  load: Req;

  /** The absolute path of every local file read, in read order. */
  documents: string[];
}

/**
 * Builds the loader every document of a build is read through. `npm:` URLs
 * resolve from the project's installed packages and read off disk; every
 * other URL goes to the caller's `req`, or to {@link request}. Each local
 * file read is recorded once in the loader's own `documents`.
 *
 * @param root - The project root `npm:` references resolve from.
 * @param req - The caller's loader for `file:` and remote documents.
 */
export const loader = (root: string, req?: Req): Loader => {
  const documents: string[] = [];

  const record = (path: string) => {
    if (!documents.includes(path)) {
      documents.push(path);
    }
  };

  const load: Req = async (src, origin) => {
    if (src.protocol === NPM) {
      const path = installed(src, root);
      record(path);
      return readFile(path, "utf8");
    }
    if (src.protocol === "file:") {
      record(fileURLToPath(src));
    }
    if (req) {
      return req(src, origin);
    }
    return request(src);
  };

  return { load, documents };
};
