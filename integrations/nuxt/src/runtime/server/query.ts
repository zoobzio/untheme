import type { H3Event } from "h3";
import type { Listing } from "untheme/catalog";

import { createError, getQuery } from "h3";
import { isQuery, toListing } from "untheme/catalog";

/**
 * Reads the listing of a request. The `q` search param holds a JSON query.
 * The function validates the query and normalizes it to a listing. A request
 * with no `q` param gets the first page of the default window. The function
 * answers 400 when `q` is invalid JSON or an invalid query.
 *
 * @param event - The request.
 * @returns The normalized listing.
 */
export const readListing = (event: H3Event): Listing => {
  const { q } = getQuery(event);

  let value: unknown = {};
  if (typeof q === "string") {
    try {
      value = JSON.parse(q);
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: "Malformed catalog query",
      });
    }
  }
  if (!isQuery(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Malformed catalog query",
    });
  }

  return toListing(value);
};
