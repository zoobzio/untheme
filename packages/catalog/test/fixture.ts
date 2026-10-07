import type { Color, Contract, Layer } from "@untheme/schema";
import type { Entry, Listing, Page } from "../src/types";

import { defineSchema } from "@untheme/schema";

/* The token names the fixture declares. */
export type Tok = "color.bg" | "color.fg";

/* The modifier axes and their contexts. */
export type Mod = { mode: { light: object; dark: object } };

export type T = Contract<Tok, Mod>;

/* Structured colors for assertions. */
export const white: Color = { colorSpace: "srgb", components: [1, 1, 1] };
export const black: Color = { colorSpace: "srgb", components: [0, 0, 0] };

/**
 * A minimal complete base theme with two color tokens and one modifier axis.
 */
export const theme: T = {
  id: "demo",
  name: "Demo",
  tokens: {
    "color.bg": { $type: "color", $value: white },
    "color.fg": { $type: "color", $value: black },
  },
  modifiers: {
    mode: {
      light: {},
      dark: { "color.bg": "{color.fg}" },
    },
  },
  order: ["mode"],
};

/**
 * The validation bundle that each catalog under test uses.
 */
export const schema = defineSchema(theme);

/**
 * A valid layer of the contract. The fixture sources return it.
 */
export const midnight: Layer<T> = {
  id: "midnight",
  name: "Midnight",
  tokens: { "color.bg": "{color.fg}" },
};

/**
 * A payload with an unknown token. It is outside the contract. It tests the
 * corruption path.
 */
export const corrupt = {
  id: "corrupt",
  name: "Corrupt",
  tokens: { ghost: "{color.fg}" },
};

/**
 * An unsorted manifest for filtering, ordering, and windowing tests. The ids
 * and names order differently. The id `abyss` sorts first and its name `The
 * Abyss` sorts last. The sort tests use this to tell the fields apart.
 */
export const entries: Entry[] = [
  { id: "nord", name: "Nord" },
  { id: "aurora", name: "Aurora" },
  { id: "midnight", name: "Midnight" },
  { id: "abyss", name: "The Abyss" },
];

/**
 * A minimal listing implementation over {@link entries}. It filters by name,
 * applies the window, and returns the counts.
 */
export const answer = (listing: Listing): Page => {
  let matches = entries;
  if (listing.search !== undefined) {
    const needle = listing.search.toLowerCase();
    matches = matches.filter((entry) =>
      entry.name.toLowerCase().includes(needle),
    );
  }
  return {
    entries: matches.slice(listing.offset, listing.offset + listing.limit),
    total: matches.length,
    limit: listing.limit,
    offset: listing.offset,
  };
};

/**
 * A valid page of the whole manifest. Transports that need only a valid body
 * use it.
 */
export const page: Page = {
  entries,
  total: entries.length,
  limit: 20,
  offset: 0,
};
