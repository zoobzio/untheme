import type { Assert, Schema, Template } from "./types";

import { defineAssert } from "./assert";
import { defineCheck } from "./check";
import { defineInspect } from "./inspect";
import { defineParse } from "./parse";
import { defineMeta } from "./meta";

/**
 * Builds the runtime validation {@link Schema} for a template's token contract.
 *
 * `meta` derives the validation core: the template's sets, the literal and
 * value rule for each token type, and the rules per kind. `check` runs those
 * rules as boolean type predicates; `assert` runs them too, collecting every
 * {@link Issue} and throwing a {@link SchemaError}; `parse` asserts and returns
 * the value narrowed; `inspect` captures the outcome as a {@link Result}
 * instead of throwing.
 *
 * The base template is validated against the `theme` kind before the schema is
 * returned, so a malformed contract fails fast at construction.
 *
 * @param base - The template whose keys define the token contract.
 * @returns A schema of derived sets, per-type rules, and
 *   check/assert/parse/inspect bundles, all narrowed to the template's token,
 *   modifier, and context vocabularies.
 */
export const defineSchema = <const T extends Template>(base: T): Schema<T> => {
  const meta = defineMeta(base);
  const check = defineCheck(meta);
  const assert: Assert<T> = defineAssert(meta);
  const parse = defineParse(assert);
  const inspect = defineInspect(parse);

  assert.theme(base);

  return { base, meta, check, assert, parse, inspect };
};
