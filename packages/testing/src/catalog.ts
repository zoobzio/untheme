import type { Layer, Schema, Template } from "untheme";
import type { Catalog, Entry, Listing, Page, Provider } from "untheme/catalog";

import { defineCatalog } from "untheme/catalog";

/**
 * Returns a catalog provider over layers in memory. `list` answers a listing
 * with the entries of the layers. It filters the entries by name when the
 * listing has a `search`, without regard to case. It sorts the entries by
 * the sort of the listing. It cuts the entries to the window of the listing.
 * `get` answers an id with its layer, or `undefined`. Every answer follows the
 * full listing, so a client over this provider pages like a real source.
 *
 * @param layers - The layers that the provider serves.
 */
export const mockProvider = <T extends Template>(
  layers: Layer<T>[],
): Provider => {
  const list = (listing: Listing): Page => {
    let entries: Entry[] = layers.map(({ id, name }) => ({ id, name }));
    if (listing.search !== undefined) {
      const needle = listing.search.toLowerCase();
      entries = entries.filter((entry) =>
        entry.name.toLowerCase().includes(needle),
      );
    }
    const { field, direction } = listing.sort;
    entries.sort((a, b) => {
      const order = a[field].localeCompare(b[field]);
      return direction === "asc" ? order : -order;
    });
    return {
      entries: entries.slice(listing.offset, listing.offset + listing.limit),
      total: entries.length,
      limit: listing.limit,
      offset: listing.offset,
    };
  };

  const get = (id: string): Layer<T> | undefined => {
    return layers.find((layer) => layer.id === id);
  };

  return { list, get };
};

/**
 * Returns a catalog over layers in memory. It is `defineCatalog` over a
 * {@link mockProvider}, so the schema checks every layer on the way out. A
 * real catalog checks the answers of its source the same way.
 *
 * @param schema - The contract that the layers must match, which is
 * `untheme.schema`.
 * @param layers - The layers that the catalog serves.
 */
export const mockCatalog = <T extends Template>(
  schema: Schema<T>,
  layers: Layer<T>[],
): Catalog<T> => {
  return defineCatalog(schema, mockProvider(layers));
};
