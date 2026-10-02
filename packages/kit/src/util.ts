import type { Source } from "./types";

import { record, wrapped } from "objectively";

/**
 * Whether a value is a reference in curly-brace syntax: a string wrapped in
 * `{` and `}`.
 */
export const isReference = wrapped("{", "}");

/**
 * A token named with its origin document, for error messages that point at
 * the user's JSON rather than this package's internals.
 */
export const cite = (token: Source): string => {
  if (token.source?.filename) {
    return `"${token.id}" (${token.source.filename})`;
  }
  return `"${token.id}"`;
};

/**
 * The braced reference form of a token id.
 */
export const braced = (id: string): `{${string}}` => {
  return `{${id}}`;
};

/**
 * Converts one node of a normalized value structurally, restoring partial
 * aliases from the parallel `partialAliasOf` branch. Terrazzo's `null` color
 * components become the schema's `"none"` sentinel; a shadow's `inset` member
 * is dropped when false and rejected when true, since untheme's shadow shape
 * carries no inset. Everything else passes through for the schema to
 * adjudicate.
 */
export const walk = (
  node: unknown,
  partial: unknown,
  token: Source,
): unknown => {
  if (typeof partial === "string") {
    return braced(partial);
  }
  if (isReference(node)) {
    return node;
  }
  if (node === null) {
    return "none";
  }
  if (Array.isArray(node)) {
    return node.map((entry, index) => {
      if (Array.isArray(partial)) {
        return walk(entry, partial[index], token);
      }
      return walk(entry, undefined, token);
    });
  }
  if (record(node)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "inset") {
        if (value === true) {
          throw new Error(
            `@untheme/kit: inset shadows are not representable — ${cite(token)}`,
          );
        }
        continue;
      }
      if (value === undefined) {
        continue;
      }
      if (record(partial)) {
        out[key] = walk(value, partial[key], token);
        continue;
      }
      out[key] = walk(value, undefined, token);
    }
    return out;
  }
  return node;
};
