import type { Layer, Template } from "untheme";
import type { Entry } from "untheme/catalog";

import { defineCachedEventHandler, useStorage } from "#imports";

import { listEntries } from "./entries";
import { createThemeHandler } from "./handler";

/** The server assets of the build: `layers.json` and `layers/<id>.json`. */
const assets = () => useStorage("assets:untheme");

const entries = async (): Promise<Entry[]> => {
  return (await assets().getItem<Entry[]>("layers.json")) ?? [];
};

/**
 * The theme catalog of the build. `list` reads the entries file. `get` reads
 * one layer file, for an id in the entries. Nitro caches each response by
 * path for a year. The path holds the build id, so a new build starts with
 * no responses.
 */
export default defineCachedEventHandler(
  createThemeHandler({
    list: async (listing) => listEntries(await entries(), listing),
    get: async (id) => {
      if (!(await entries()).some((entry) => entry.id === id)) {
        return null;
      }
      return assets().getItem<Layer<Template>>(`layers/${id}.json`);
    },
  }),
  { name: "untheme", maxAge: 60 * 60 * 24 * 365 },
);
