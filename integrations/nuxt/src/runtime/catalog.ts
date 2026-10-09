import type { Schema } from "untheme";
import type { Catalog } from "untheme/catalog";
import type { AppUnthemeContract } from "./types";

import { layers, load } from "#build/untheme/layers.mjs";
import { defineCatalog } from "untheme/catalog";

import { listEntries } from "./entries";

/**
 * Makes a catalog over the layers of the build. `list` pages the entries of
 * the layers module. `get` imports one layer on demand and checks it against
 * the contract. The catalog is empty when the build has no layers.
 */
export const makeCatalog = (
  schema: Schema<AppUnthemeContract>,
): Catalog<AppUnthemeContract> => {
  return defineCatalog(schema, {
    list: (listing) => listEntries(layers, listing),
    get: (id) => (Object.hasOwn(load, id) ? load[id]?.() : undefined),
  });
};
