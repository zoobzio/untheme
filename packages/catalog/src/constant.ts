import type { Sort } from "./types";

/**
 * The window size of a query that has no `limit`.
 */
export const LIMIT = 20;

/**
 * The ordering of a query that has no `sort`.
 */
export const SORT: Sort = { field: "name", direction: "asc" };

/**
 * The path segment that follows the base URL of a client. Listings are at
 * `{base}/themes`. Payloads are at `{base}/themes/{id}`.
 */
export const ROUTE = "themes";
