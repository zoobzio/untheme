/**
 * The mount point of the module's catalog endpoints. The wire routes extend
 * this base — listings at `${MOUNT}/themes`, payloads at
 * `${MOUNT}/themes/{id}` — and a catalog client on the app side points its
 * `base` here.
 */
export const MOUNT = "/api/untheme";

/**
 * The server-assets base the module writes the catalog under: the routes
 * read their data from the `assets:${ASSETS}` storage.
 */
export const ASSETS = "untheme";

/**
 * The asset key of the manifest: the entries the listing route filters,
 * orders, and windows.
 */
export const ENTRIES = "entries.json";

/**
 * The asset key of the payload record: the layers the retrieval route
 * answers with, keyed by id.
 */
export const THEMES = "themes.json";
