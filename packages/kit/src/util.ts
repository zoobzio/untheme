import type { Source } from "./types";

import { record, wrapped } from "objectively";

/**
 * Whether a value is a reference in curly-brace syntax. This is a string that
 * starts with `{` and ends with `}`.
 */
export const isReference = wrapped("{", "}");

/**
 * Names a token with its origin document, for an error message.
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
 * Converts one node of a normalized value. The function restores partial aliases
 * from the parallel `partialAliasOf` branch. A `null` color component of
 * Terrazzo becomes the schema value `"none"`. The function drops the `inset`
 * member of a shadow when it is false and throws when it is true. The function
 * returns all other values unchanged.
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

/** Maps every `$ref` below a node. */
export const refs = (node: unknown, fn: (ref: string) => string): unknown => {
  if (Array.isArray(node)) {
    return node.map((item) => refs(item, fn));
  }
  if (record(node)) {
    return rewrite(node, fn);
  }
  return node;
};

/** Returns a copy of a document with every `$ref` mapped through `fn`. */
export const rewrite = (
  document: Record<string, unknown>,
  fn: (ref: string) => string,
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(document).map(([key, value]) => {
      if (key === "$ref" && typeof value === "string") {
        return [key, fn(value)];
      }
      return [key, refs(value, fn)];
    }),
  );
};
