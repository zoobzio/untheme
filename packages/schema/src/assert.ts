import type {
  Assert,
  Binding,
  Input,
  Issue,
  Layer,
  Meta,
  Modifier,
  Modifiers,
  Open,
  Overrides,
  Patch,
  Reference,
  Rule,
  Authored,
  Template,
  Theme,
  Token,
  Type,
  Values,
} from "./types";

import { SchemaError } from "./error";

/**
 * Builds the {@link Assert} bundle: each kind runs every rule, collects all the
 * {@link Issue}s, and throws a {@link SchemaError} if any were found. Unlike a
 * {@link Check}, it reports every failure in one pass rather than stopping at
 * the first.
 */
export const defineAssert = <T extends Template>({
  rules,
}: Meta<T>): Assert<T> => {
  const assert = (v: unknown, list: Rule[]) => {
    const issues = list.reduce<Issue[]>((acc, rule) => {
      const issue = rule(v);
      if (issue) {
        acc.push(issue);
      }
      return acc;
    }, []);
    if (issues.length > 0) {
      throw new SchemaError(issues);
    }
  };
  return {
    modifier: (v: unknown): asserts v is Modifier<T> =>
      assert(v, rules.modifier),
    value: (v: unknown): asserts v is Values<Open>[Type] =>
      assert(v, rules.value),
    token: (v: unknown): asserts v is Token<T> => assert(v, rules.token),
    reference: (v: unknown): asserts v is Reference<T> =>
      assert(v, rules.reference),
    binding: (v: unknown): asserts v is Binding<T> => assert(v, rules.binding),
    definition: (v: unknown): asserts v is Authored<Token<T>> =>
      assert(v, rules.definition),
    overrides: (v: unknown): asserts v is Overrides<T> =>
      assert(v, rules.overrides),
    tokens: (v: unknown): asserts v is Theme<T>["tokens"] =>
      assert(v, rules.tokens),
    modifiers: (v: unknown): asserts v is Modifiers<T> =>
      assert(v, rules.modifiers),
    order: (v: unknown): asserts v is Theme<T>["order"] =>
      assert(v, rules.order),
    input: (v: unknown): asserts v is Input<T> => assert(v, rules.input),
    theme: (v: unknown): asserts v is Theme<T> => assert(v, rules.theme),
    layer: (v: unknown): asserts v is Layer<T> => assert(v, rules.layer),
    patch: (v: unknown): asserts v is Patch<T> => assert(v, rules.patch),
  };
};
