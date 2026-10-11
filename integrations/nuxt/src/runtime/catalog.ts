import type { Schema } from "untheme";
import type { Catalog, Entry } from "untheme/catalog";
import type { AppUnthemeContract } from "./types";

import { layers, load } from "#build/untheme/layers.mjs";
import { defineCatalog } from "untheme/catalog";

/**
 * Makes a catalog over the layers of the build. `list` pages the entries of
 * the layers module. `get` imports one layer on demand and checks it against
 * the contract. The catalog is empty when the build has no layers.
 */
export const makeCatalog = (
  schema: Schema<AppUnthemeContract>,
): Catalog<AppUnthemeContract> => {
  return defineCatalog(schema, {
    list: (listing) => {
      let matches: readonly Entry[] = layers;
      if (listing.search !== undefined) {
        const needle = listing.search.toLowerCase();
        matches = matches.filter((entry) =>
          entry.name.toLowerCase().includes(needle),
        );
      }

      const { field, direction } = listing.sort;
      const sorted = [...matches].sort((a, b) => {
        if (direction === "asc") {
          return a[field].localeCompare(b[field]);
        }
        return b[field].localeCompare(a[field]);
      });

      return {
        entries: sorted.slice(listing.offset, listing.offset + listing.limit),
        total: sorted.length,
        limit: listing.limit,
        offset: listing.offset,
      };
    },
    get: (id) => (Object.hasOwn(load, id) ? load[id]?.() : undefined),
  });
};
