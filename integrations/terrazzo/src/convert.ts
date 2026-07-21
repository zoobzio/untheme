import type { Source } from "./types";

import { has, wrapped } from "objectively";
import { REJECTED_TYPES } from "./constant";
import { braced, cite, walk } from "./util";

/**
 * Whether a value is a token definition: a non-array object carrying a
 * `$value` member.
 */
const isDefinition = has("$value");

/**
 * Whether a value is a reference in curly-brace syntax: a string wrapped in
 * `{` and `}`.
 */
const isReference = wrapped("{", "}");

/**
 * The authored binding for a token. A whole-token alias is reconstructed from
 * the metadata Terrazzo keeps after resolution — the raw authored value
 * first, the final alias target as fallback — so the emitted config keeps
 * references live instead of baking in resolved literals. Everything else is
 * the structurally converted value with partial aliases restored in place.
 */
export const binding = (token: Source): unknown => {
  if (REJECTED_TYPES.has(token.$type)) {
    throw new Error(
      `untheme terrazzo: token type "${token.$type}" is not part of the DTCG format and has no untheme equivalent — ${cite(token)}`,
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
 * The full definition slot for a token: declared type, converted binding, and
 * the spec metadata carried through when present. Terrazzo's `$extends` and
 * its internal bookkeeping members do not survive.
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
 * The fully resolved literal for a token — no alias reconstruction, just the
 * structural conversion of Terrazzo's dereferenced value. The round-trip
 * verifier compares this against untheme's own resolution.
 */
export const literal = (token: Source): unknown => {
  return walk(token.$value, undefined, token);
};

/**
 * Rejects token names that would collide as CSS custom properties: the CSS
 * renderer rewrites every dot to a dash, so `a.b` and `a-b` would both render
 * as `--a-b` and silently shadow each other.
 */
export const collisions = (ids: string[]): void => {
  const seen = new Map<string, string>();
  for (const id of ids) {
    const dashed = id.replace(/\./g, "-");
    const other = seen.get(dashed);
    if (other !== undefined && other !== id) {
      throw new Error(
        `untheme terrazzo: token names "${other}" and "${id}" both become --${dashed} as CSS custom properties — rename one`,
      );
    }
    seen.set(dashed, id);
  }
};
