import type { H3Event } from "h3";
import type { Listing } from "untheme/catalog";

import { createError, getQuery } from "h3";
import { isQuery, toListing } from "untheme/catalog";

/**
 * Reads the listing a request carries. The `q` search param holds a
 * JSON-encoded query — an absent param lists the first page under the
 * default window — validated and normalized to a concrete listing. Answers
 * 400 when the param is not JSON or not a query.
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
