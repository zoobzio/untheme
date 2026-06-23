import type { Template, Schema, Assert } from "./types";

import { defineLexicon } from "./lexicon";
import { defineGuard } from "./guard";
import { defineAssert } from "./assert";
import { defineParse } from "./parse";

/**
 * Builds the runtime validation {@link Schema} for a template's token
 * contract.
 *
 * The factories layer over a shared rule set: `lexicon` derives the template's
 * token {@link Set}s and a list of {@link Rule}s per tier, composed from the
 * type-agnostic atoms in `util`. `guard` runs those rules as boolean type
 * predicates; `assert` runs them too, but collects every {@link Issue} and
 * throws a {@link SchemaError}; `parse` asserts and returns the value narrowed.
 *
 * The tiers range from scalars (`mode`, `value`, the token-name tiers) to the
 * composite shapes (`tokens`, `patch`, `layer`, `theme`), each validating
 * progressively more of the contract — membership, tier aliasing, value
 * containment, completeness, and light/dark parity.
 *
 * @param base - The template whose keys define the token contract.
 * @returns A schema of token sets and guard/assert/parse bundles, all
 *   narrowed to the template's token unions.
 */
export const defineSchema = <const T extends Template>(base: T): Schema<T> => {
  const lexicon = defineLexicon(base);
  const guard = defineGuard(lexicon);
  const assert: Assert<T> = defineAssert(lexicon);
  const parse = defineParse(assert);

  // baseline check - ensures base template follows structural rules
  assert.theme(base);

  return {
    base,
    lexicon,
    guard,
    assert,
    parse,
  };
};
