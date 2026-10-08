import { entries, layers } from "#untheme/layers.mjs";

import { listEntries } from "./entries";
import { createThemeHandler } from "./handler";

/**
 * The theme catalog that the module serves. The module registers this handler
 * under the `route` of its options, as a catch-all, when the build has layers.
 * The entries and the layers come from the `#untheme/layers.mjs` server
 * template that the module writes from the build. `list` answers a page of
 * entries. `get` answers one layer, or a miss for an id outside the build.
 */
export default createThemeHandler({
  list: (listing) => listEntries(entries, listing),
  get: (id) => layers[id] ?? null,
});
