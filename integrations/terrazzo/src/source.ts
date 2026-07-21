import type { Resolver } from "@terrazzo/parser";
import type { SharedOptions } from "./types";

import { entries, keys } from "objectively";

import { synthetic } from "./contexts";

/**
 * Resolves a source designator to a URL: absolute URLs pass through, strings
 * resolve against `base` (an `https:` string stays absolute, a plain path
 * lands under the base).
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
    const { readFile } = await import("node:fs/promises");
    return readFile(src, "utf8");
  }
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(
      `untheme terrazzo: fetching ${src.href} failed with ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
};

/**
 * The process working directory as a trailing-slash file URL — the default
 * base that relative source paths resolve against.
 */
export const workspace = async (): Promise<URL> => {
  const { pathToFileURL } = await import("node:url");
  return new URL(`${pathToFileURL(process.cwd()).href}/`);
};

/**
 * Identity for the emitted base theme: explicit options win, then the
 * resolver document's own name — the id is its lowercase slug. A plain token
 * document carries no name (its synthetic resolver's name is Terrazzo's own),
 * so there the options are required.
 */
export const identity = (
  options: SharedOptions,
  resolver: Resolver | undefined,
): { id: string; name: string } => {
  let declared = resolver?.source.name;
  const axes = entries(resolver?.source.modifiers ?? {});
  const bridged =
    axes.length > 0 &&
    axes.every(([axis, modifier]) => synthetic(axis, keys(modifier.contexts)));
  if (bridged) {
    declared = undefined;
  }
  const name = options.name ?? declared;
  if (name === undefined) {
    throw new Error(
      'untheme terrazzo: no theme identity — name the resolver document, or pass "id" and "name" options',
    );
  }
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const id = options.id ?? slug;
  if (!id) {
    throw new Error(
      `untheme terrazzo: the name "${name}" slugs to an empty id — pass an explicit "id" option`,
    );
  }
  return { id, name };
};

/**
 * Layer identity for a theme document: the entry's own id and name win, the
 * document filename fills the gaps.
 */
export const identify = (
  entry: { id?: string; name?: string },
  url: URL,
): { id: string; name: string } => {
  if (entry.id) {
    return { id: entry.id, name: entry.name ?? entry.id };
  }
  const basename = url.pathname.split("/").pop() ?? "";
  const id = basename.replace(/\.[^.]*$/, "");
  if (!id) {
    throw new Error(
      `untheme terrazzo: cannot derive an id for theme document ${url.href} — set "id" on the theme entry`,
    );
  }
  return { id, name: entry.name ?? id };
};
