import type { EventHandler } from "h3";
import type { Entry } from "untheme/catalog";

import manifest from "@untheme/aurora/themes/index.json" with { type: "json" };

import { createThemeHandler, listEntries } from "../server";
import { files } from "./files";

/**
 * An aurora theme as served: identity, and a binding for every ramp token.
 */
export interface AuroraLayer {
  id: string;
  name: string;
  tokens: Record<string, unknown>;
}

/**
 * One aurora theme as a layer: its `id` and `name` from aurora's manifest,
 * and each token's `$value` from every file of the theme folder as its
 * binding. Plain JSON reads — no Terrazzo at run time. Resolves `undefined`
 * for an id aurora does not ship.
 *
 * @param id - The theme id.
 */
export const loadAuroraTheme = async (
  id: string,
): Promise<AuroraLayer | undefined> => {
  const entry = manifest.find((theme) => theme.id === id);
  const loaders = files[id];
  if (entry === undefined || loaders === undefined) {
    return undefined;
  }

  const tokens: Record<string, unknown> = {};
  const documents = await Promise.all(
    Object.values(loaders).map(async (load) => (await load()).default),
  );
  for (const document of documents) {
    for (const [token, definition] of Object.entries(document)) {
      tokens[token] = definition.$value;
    }
  }
  return { id: entry.id, name: entry.name, tokens };
};

/**
 * The catalog entries for every aurora theme: id, name and description, in
 * aurora's manifest order.
 */
export const auroraThemes: Entry[] = manifest;

/**
 * {@link createThemeHandler} over aurora's theme files: lists aurora's 31
 * themes and answers each as a layer, so an app built on aurora switches
 * between all of them. Put it in a catch-all server route file; the file's
 * folder is the base:
 *
 * ```ts
 * // server/api/untheme/[...path].get.ts — base "/api/untheme"
 * import { createAuroraThemeHandler } from "@untheme/nuxt/aurora";
 *
 * export default createAuroraThemeHandler();
 * ```
 *
 * Each layer rebinds aurora's ramp tokens, so the app's contract must carry
 * every one of aurora's ramps for the browser client to accept it.
 */
export const createAuroraThemeHandler = (): EventHandler => {
  return createThemeHandler({
    list: (listing) => listEntries(auroraThemes, listing),
    get: loadAuroraTheme,
  });
};
