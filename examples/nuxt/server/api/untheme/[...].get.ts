import { createThemeHandler, listEntries } from "@untheme/nuxt/server";
import { layers } from "@untheme/aurora/layers";

/**
 * The theme catalog of the app, under `/api/untheme`. The themes are the
 * layers of aurora. `list` reads the layers manifest. `get` reads one layer
 * file from the `themes` server assets. An id outside the manifest is a miss.
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
