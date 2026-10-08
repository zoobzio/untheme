import type { Req } from "./types";

import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
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

/** Splits the specifier of an `npm:/` URL into the package name and the path inside it. */
const split = (src: URL): { name: string; inside: string } => {
  const specifier = decodeURIComponent(src.pathname).replace(/^\/+/, "");
  const segments = specifier.split("/");
  const depth = specifier.startsWith("@") ? 2 : 1;
  return {
    name: segments.slice(0, depth).join("/"),
    inside: segments.slice(depth).join("/"),
  };
};

/** The name in a package.json, when the file reads. */
const named = (path: string): string | undefined => {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (parsed && typeof parsed === "object" && "name" in parsed) {
      return typeof parsed.name === "string" ? parsed.name : undefined;
    }
  } catch {
    // No package.json, or not JSON.
  }
  return undefined;
};

/**
 * Resolves an `npm:/` URL that names a directory to that directory on disk. A
 * package exports files, not directories, so the function finds the package
 * itself: the project when the project is the package, or the package in the
 * `node_modules` that Node resolution searches from the project root. The
 * path inside the package is joined to it. The files in the directory still
 * resolve through the exports of the package when the build reads them.
 *
 * @param src - The `npm:/` URL of the directory.
 * @param root - The project root that packages resolve from.
 * @throws Error when no installed package has the name.
 */
export const installedDirectory = (src: URL, root: string): string => {
  const { name, inside } = split(src);
  const require = createRequire(join(root, "package.json"));
  let found: string | undefined;
  if (named(join(root, "package.json")) === name) {
    found = root;
  } else {
    for (const candidate of require.resolve.paths(name) ?? []) {
      if (existsSync(join(candidate, name, "package.json"))) {
        found = join(candidate, name);
        break;
      }
    }
  }
  if (found === undefined) {
    try {
      found = dirname(require.resolve(`${name}/package.json`));
    } catch (error) {
      throw new Error(
        `@untheme/kit: cannot resolve ${src.href} — "${name}" is not an installed package (from ${root})`,
        { cause: error },
      );
    }
  }
  return join(found, inside);
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
