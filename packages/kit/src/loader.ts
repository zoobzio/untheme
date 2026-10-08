import type { Req } from "./types";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { NPM } from "./constant";
import { request } from "./source";

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
 * The loader of one build. It has the function that reads every document and the
 * local files that the function has read.
 */
export interface Loader {
  /** Reads one document. The kit hands it to the parser as `req`. */
  load: Req;

  /**
   * The absolute path of every local file read, in read order. The layer
   * builder adds the layers directory when the config names one.
   */
  documents: string[];
}

/**
 * Makes the loader that reads every document of a build. `npm:` URLs resolve
 * from the installed packages of the project and are read from disk. All other
 * URLs go to the `req` of the caller, or to {@link request}. The loader records
 * each local file once in `documents`.
 *
 * @param root - The project root that `npm:` references resolve from.
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
