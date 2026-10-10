import type { Source } from "./types";

import { entries, has, record } from "objectively";

import { REJECTED_TYPES } from "./constant";
import { braced, cite, isReference } from "./util";

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
    for (const [key, value] of entries(node)) {
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

/**
 * Whether a value is a token definition, an object that is not an array and has
 * a `$value` member.
 */
const isDefinition = has("$value");

/**
 * Returns the authored binding of a token. For a whole-token alias, the function
 * makes the alias from the metadata that Terrazzo keeps after resolution. It
 * reads the raw authored value first and the final alias target second. The
 * emitted config keeps references live. For all other tokens, the function
 * returns the converted value with partial aliases restored in place.
 */
export const binding = (token: Source): unknown => {
  if (REJECTED_TYPES.has(token.$type)) {
    throw new Error(
      `@untheme/kit: token type "${token.$type}" is not part of the DTCG format and has no untheme equivalent — ${cite(token)}`,
    );
  }
  const original = token.originalValue;
  if (isDefinition(original) && isReference(original.$value)) {
    return original.$value;
  }
  if (typeof token.aliasOf === "string") {
    return braced(token.aliasOf);
  }
  return walk(token.$value, token.partialAliasOf, token);
};

/**
 * Returns the full definition slot of a token. The slot has the declared type,
 * the converted binding, and the spec metadata when present.
 */
export const definition = (token: Source): Record<string, unknown> => {
  const slot: Record<string, unknown> = {
    $type: token.$type,
    $value: binding(token),
  };
  if (token.$description !== undefined) {
    slot.$description = token.$description;
  }
  if (token.$deprecated !== undefined) {
    slot.$deprecated = token.$deprecated;
  }
  if (token.$extensions !== undefined) {
    slot.$extensions = token.$extensions;
  }
  return slot;
};

/**
 * Returns the fully resolved literal of a token, converted from the dereferenced
 * Terrazzo value. The verifier compares it with the untheme resolution.
 */
export const literal = (token: Source): unknown => {
  return walk(token.$value, undefined, token);
};

/**
 * Throws when two token names become the same CSS custom property. The CSS
 * renderer replaces every dot with a dash. The names `a.b` and `a-b` both render
 * as `--a-b`.
 */
export const collisions = (ids: string[]): void => {
  const seen = new Map<string, string>();
  for (const id of ids) {
    const dashed = id.replace(/\./g, "-");
    const other = seen.get(dashed);
    if (other !== undefined && other !== id) {
      throw new Error(
        `@untheme/kit: token names "${other}" and "${id}" both become --${dashed} as CSS custom properties — rename one`,
      );
    }
    seen.set(dashed, id);
  }
};
