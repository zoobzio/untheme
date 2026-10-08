import type { H3Event } from "h3";

import { createError } from "h3";
import { ROUTE } from "untheme/catalog";

/**
 * Splits a path into segments and drops the empty segments.
 */
const segments = (path: string): string[] => {
  return path.split("/").filter((segment) => segment !== "");
};

/**
 * Returns the segments of the request path below the base of the handler. In
 * a catch-all route file, the router records the matched route. The base is
 * that route minus the catch-all segment. The function removes the segments
 * of the base from the request path. When no route matched, as with a handler
 * mounted on a prefix, the function returns all segments of the event path.
 */
const below = (event: H3Event): string[] => {
  const [path = ""] = event.path.split("?");
  const route = event.context.matchedRoute?.path;
  if (route === undefined) {
    return segments(path);
  }
  const base = segments(route).filter((segment) => !segment.startsWith("**"));
  return segments(path).slice(base.length);
};

/**
 * Reads the target of a request. The path `themes` asks for a listing. The
 * path `themes/{id}` asks for one layer. The function answers 404 for any
 * other path below the base. It answers 400 when the id cannot be decoded.
 *
 * @param event - The request.
 * @returns The decoded theme id, or `undefined` for a listing.
 */
export const readTarget = (event: H3Event): string | undefined => {
  const [root, encoded, ...rest] = below(event);
  if (root !== ROUTE || rest.length > 0) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  if (encoded === undefined) {
    return undefined;
  }
  try {
    return decodeURIComponent(encoded);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Malformed theme id",
    });
  }
};
