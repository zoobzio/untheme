import type { EventHandler } from "h3";
import type { Provider } from "untheme/catalog";

import { createError, defineEventHandler } from "h3";
import { isPage } from "untheme/catalog";

import { readListing } from "./query";
import { readTarget } from "./route";

/**
 * Creates the event handler that serves a theme catalog with the catalog wire
 * protocol. `defineClient` from `untheme/catalog` reads this protocol. The
 * handler answers two requests.
 *
 * - `GET {base}/themes?q=<JSON query>` answers a page of entries.
 * - `GET {base}/themes/{id}` answers one layer, or 404.
 *
 * Put the handler in a catch-all server route file. The folder of the file is
 * the base.
 *
 * ```ts
 * // server/api/theme/[...path].get.ts, base "/api/theme"
 * export default createThemeHandler({
 *   list: (listing) => listEntries(entries, listing),
 *   get: (id) => storage.getItem(`themes:${id}`),
 * });
 * ```
 *
 * The provider connects the handler to the store of the themes. The handler
 * serves each layer as the provider returns it.
 *
 * @param provider - The storage callbacks. `list` answers a normalized
 * listing with a page. `get` answers an id with a layer, or with `null` or
 * `undefined` when no layer matches.
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
