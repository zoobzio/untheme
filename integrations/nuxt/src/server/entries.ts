import type { Entry, Listing, Page } from "untheme/catalog";

/**
 * Answers a listing over entries held in memory: filters by name,
 * case-insensitively, orders by the listing's field and direction, and cuts
 * its window. `total` counts every match, not the page. For providers that
 * keep their whole manifest at hand.
 *
 * @param entries - Every entry the provider holds.
 * @param listing - The normalized listing the handler received.
 * @returns The page the listing selects.
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
