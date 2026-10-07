import type { Assert, Schema, Template } from "./types";

import { defineAssert } from "./assert";
import { defineCheck } from "./check";
import { defineInspect } from "./inspect";
import { defineParse } from "./parse";
import { defineMeta } from "./meta";

/**
 * Builds the runtime validation {@link Schema} for the token contract of a
 * template.
 *
 * `meta` holds the template's sets, the literal rule and value rule for each
 * token type, and the rules for each kind. `check` runs the rules as boolean
 * type predicates. `assert` runs the rules, collects every {@link Issue}, and
 * throws a {@link SchemaError}. `parse` asserts the value and returns it
 * narrowed. `inspect` returns the outcome as a {@link Result}.
 *
 * The function validates the base template against the `theme` kind before it
 * returns the schema. An invalid template throws at construction.
 *
 * @param base - The template whose keys define the token contract.
 * @returns A schema with the sets, the rules for each type, and the check,
 *   assert, parse, and inspect bundles. The bundles use the token, modifier,
 *   and context names of the template.
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
