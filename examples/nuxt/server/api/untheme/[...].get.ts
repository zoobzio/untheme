import { createThemeHandler, listEntries } from "@untheme/nuxt/server";
import { layers } from "@untheme/aurora/layers";

/**
 * The theme catalog of the app. The themes are the layers of aurora. The
 * route answers the catalog wire protocol under `/api/untheme`.
 *
 * `list` answers from the layers manifest of aurora, which the server bundle
 * holds. `get` reads one layer file from the server assets. `nuxt.config.ts`
 * puts the `layers/` directory of the aurora build there, so the output of
 * `nuxt build` holds the files and reads nothing from `node_modules` at run
 * time. An id outside the manifest is a miss.
 */
const entries = layers.map(({ id, name }) => ({ id, name }));
const ids = new Set<string>(entries.map((entry) => entry.id));

export default createThemeHandler({
  list: (listing) => listEntries(entries, listing),
  get: (id) => {
    if (!ids.has(id)) {
      return null;
    }
    return useStorage("assets:themes").getItem(`${id}.json`);
  },
});
