import type { Entry, Listing, Page } from "untheme/catalog";

/**
 * Answers a listing from entries in memory. The function filters the entries
 * by name and ignores case. It orders the entries by the field and direction
 * of the listing. It then cuts the window of the listing. `total` is the
 * count of all matches.
 *
 * @param entries - All entries of the provider.
 * @param listing - The normalized listing that the handler received.
 * @returns The page that the listing selects.
 */
export const listEntries = (entries: Entry[], listing: Listing): Page => {
  let matches = entries;
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
};
