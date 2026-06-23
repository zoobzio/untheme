import type {
  Template,
  Assert,
  Rule,
  Issue,
  Lexicon,
  Mode,
  Value,
  Reference,
  System,
  Role,
  Alias,
  Token,
  Tokens,
  Patch,
  Layer,
  Theme,
} from "./types";

import { SchemaError } from "./error";

/**
 * Builds the {@link Assert} bundle: each tier runs every rule, collects all the
 * {@link Issue}s, and throws a {@link SchemaError} if any were found. Unlike a
 * guard, it reports every failure in one pass rather than stopping at the first.
 */
export const defineAssert = <T extends Template>(
  lexicon: Lexicon<T>,
): Assert<T> => {
  const assert = (v: unknown, rules: Rule[]) => {
    const issues = rules.reduce<Issue[]>((iss, rule) => {
      const issue = rule(v);
      if (issue) {
        iss.push(issue);
      }
      return iss;
    }, []);
    if (issues.length > 0) {
      throw new SchemaError(issues);
    }
    return;
  };
  return {
    mode: (v: unknown): asserts v is Mode => assert(v, lexicon.rules.mode),
    value: (v: unknown): asserts v is Value => assert(v, lexicon.rules.value),
    reference: (v: unknown): asserts v is Reference<T> =>
      assert(v, lexicon.rules.reference),
    system: (v: unknown): asserts v is System<T> =>
      assert(v, lexicon.rules.system),
    role: (v: unknown): asserts v is Role<T> => assert(v, lexicon.rules.role),
    alias: (v: unknown): asserts v is Alias<T> =>
      assert(v, lexicon.rules.alias),
    token: (v: unknown): asserts v is Token<T> =>
      assert(v, lexicon.rules.token),
    tokens: (v: unknown): asserts v is Tokens<T> =>
      assert(v, lexicon.rules.tokens),
    patch: (v: unknown): asserts v is Patch<T> =>
      assert(v, lexicon.rules.patch),
    layer: (v: unknown): asserts v is Layer<T> =>
      assert(v, lexicon.rules.layer),
    theme: (v: unknown): asserts v is Theme<T> =>
      assert(v, lexicon.rules.theme),
  };
};
