import type { Color, Contract, Layer } from "@untheme/schema";
import type { Entry, Listing, Page } from "../src/types";

import { defineSchema } from "@untheme/schema";

/* The token names the fixture declares. */
export type Tok = "color.bg" | "color.fg";

/* The modifier axes and their contexts. */
export type Mod = { mode: { light: object; dark: object } };

export type T = Contract<Tok, Mod>;

/* Structured colors named once so assertions can compare against them. */
export const white: Color = { colorSpace: "srgb", components: [1, 1, 1] };
export const black: Color = { colorSpace: "srgb", components: [0, 0, 0] };

/**
 * A minimal complete base theme: two color tokens and one modifier axis,
 * enough contract for the schema to prove layers against.
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
 * The validation bundle every catalog under test is constructed with.
 */
export const schema = defineSchema(theme);

/**
 * A valid layer of the contract, retrievable from the fixture sources.
 */
export const midnight: Layer<T> = {
  id: "midnight",
  name: "Midnight",
  tokens: { "color.bg": "{color.fg}" },
};

/**
 * A payload that exists but steps outside the contract — an unknown token —
 * for exercising the corruption path.
 */
export const corrupt = {
  id: "corrupt",
  name: "Corrupt",
  tokens: { ghost: "{color.fg}" },
};

/**
 * An unsorted manifest exercising filtering, ordering, and windowing. Ids
 * and names deliberately order differently — the id `abyss` sorts first
 * while its name `The Abyss` sorts last — so sort-field tests can tell the
 * fields apart.
 */
export const entries: Entry[] = [
  { id: "nord", name: "Nord" },
  { id: "aurora", name: "Aurora" },
  { id: "midnight", name: "Midnight" },
  { id: "abyss", name: "The Abyss" },
];

/**
 * A minimal listing implementation over {@link entries} — name filter and
 * window, honest counts — standing in for whatever real lookup a source
 * binds its `list` callback to.
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
 * A well-formed page of the whole manifest, for transports that only need
 * a valid body.
 */
export const page: Page = {
  entries,
  total: entries.length,
  limit: 20,
  offset: 0,
};
