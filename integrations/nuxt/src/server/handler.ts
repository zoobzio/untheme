import type { EventHandler } from "h3";
import type { Provider } from "untheme/catalog";

import { createError, defineEventHandler } from "h3";
import { isPage } from "untheme/catalog";

import { readListing } from "./query";
import { readTarget } from "./route";

/**
 * Creates the one event handler that serves a theme catalog over the
 * catalog wire protocol, so `defineClient` from `untheme/catalog` reads it
 * unchanged:
 *
 * - `GET {base}/themes?q=<JSON query>` answers a page of entries
 * - `GET {base}/themes/{id}` answers one layer, or 404
 *
 * Put it in a catch-all server route file; the file's folder is the base:
 *
 * ```ts
 * // server/api/untheme/[...path].get.ts — base "/api/untheme"
 * export default createThemeHandler({
 *   list: (listing) => listEntries(entries, listing),
 *   get: (id) => storage.getItem(`themes:${id}`),
 * });
 * ```
 *
 * The provider binds the handler to wherever the themes are stored. Layers
 * are served as the provider returns them: the browser client proves each
 * one against the app's contract when it arrives.
 *
 * @param provider - The storage callbacks: `list` answers a normalized
 * listing with a page, `get` answers an id with a layer, or `null` /
 * `undefined` for a miss.
 * @returns The h3 event handler.
 */
export const createThemeHandler = (provider: Provider): EventHandler => {
  return defineEventHandler(async (event) => {
    const id = readTarget(event);

    if (id === undefined) {
      const page: unknown = await provider.list(readListing(event));
      if (!isPage(page)) {
        throw createError({
          statusCode: 500,
          statusMessage: "Catalog listing unavailable",
        });
      }
      return page;
    }

    const layer: unknown = await provider.get(id);
    if (layer === undefined || layer === null) {
      throw createError({ statusCode: 404, statusMessage: "Theme not found" });
    }
    return layer;
  });
};
