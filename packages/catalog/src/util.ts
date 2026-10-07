import type { Entry, Listing, Page, Query, Sort } from "./types";

import { record } from "objectively";

import { LIMIT, SORT } from "./constant";

/**
 * Checks for a whole non-negative number. `limit`, `offset`, and `total` use
 * it.
 */
const isCount = (value: unknown): value is number => {
  if (typeof value !== "number") {
    return false;
  }
  return Number.isInteger(value) && value >= 0;
};

/**
 * Checks for a {@link Sort}: an entry field and a direction. A key other than
 * `field` and `direction` fails the check.
 */
const isSort = (value: unknown): value is Sort => {
  if (!record(value)) {
    return false;
  }
  for (const key of Object.keys(value)) {
    if (key !== "field" && key !== "direction") {
      return false;
    }
  }
  if (value.field !== "id" && value.field !== "name") {
    return false;
  }
  return value.direction === "asc" || value.direction === "desc";
};

/**
 * Checks for a {@link Query}. Each present field must have its declared shape.
 * A key other than `search`, `sort`, `limit`, and `offset` fails the check.
 */
export const isQuery = (value: unknown): value is Query => {
  if (!record(value)) {
    return false;
  }
  for (const key of Object.keys(value)) {
    if (
      key !== "search" &&
      key !== "sort" &&
      key !== "limit" &&
      key !== "offset"
    ) {
      return false;
    }
  }
  if (value.search !== undefined && typeof value.search !== "string") {
    return false;
  }
  if (value.sort !== undefined && !isSort(value.sort)) {
    return false;
  }
  if (value.limit !== undefined && !isCount(value.limit)) {
    return false;
  }
  return value.offset === undefined || isCount(value.offset);
};

/**
 * Fills the gaps of a query with the default ordering and window. Returns the
 * concrete {@link Listing}. `search` is present only when the query has a
 * `search`.
 */
export const toListing = (query: Query): Listing => {
  const listing: Listing = {
    sort: query.sort ?? SORT,
    limit: query.limit ?? LIMIT,
    offset: query.offset ?? 0,
  };
  if (query.search !== undefined) {
    listing.search = query.search;
  }
  return listing;
};

/**
 * Checks for an {@link Entry}: a non-empty id and a name. Other fields pass the
 * check.
 */
const isEntry = (value: unknown): value is Entry => {
  if (!record(value)) {
    return false;
  }
  if (typeof value.id !== "string" || value.id.length === 0) {
    return false;
  }
  return typeof value.name === "string" && value.name.length > 0;
};

/**
 * Checks for a {@link Page}: an array of entries and the counts `total`,
 * `limit`, and `offset`.
 */
export const isPage = (value: unknown): value is Page => {
  if (!record(value)) {
    return false;
  }
  if (!Array.isArray(value.entries)) {
    return false;
  }
  if (!value.entries.every(isEntry)) {
    return false;
  }
  return isCount(value.total) && isCount(value.limit) && isCount(value.offset);
};
