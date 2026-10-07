import type { Inspect, Parse, Result, Template } from "./types";

import { SchemaError } from "./error";

/**
 * Builds the {@link Inspect} bundle. Each kind runs its {@link Parse} and
 * returns a {@link Result}. A success result holds the narrowed value. A
 * failure result holds the issues. Errors of other types propagate to the
 * caller.
 */
export const defineInspect = <T extends Template>(
  parse: Parse<T>,
): Inspect<T> => {
  const inspect =
    <V>(parseFn: (v: unknown) => V) =>
    (v: unknown): Result<V> => {
      try {
        return { success: true, data: parseFn(v) };
      } catch (error) {
        if (error instanceof SchemaError) {
          return { success: false, issues: error.issues };
        }
        throw error;
      }
    };
  return {
    modifier: inspect(parse.modifier),
    value: inspect(parse.value),
    token: inspect(parse.token),
    reference: inspect(parse.reference),
    binding: inspect(parse.binding),
    definition: inspect(parse.definition),
    overrides: inspect(parse.overrides),
    tokens: inspect(parse.tokens),
    modifiers: inspect(parse.modifiers),
    order: inspect(parse.order),
    input: inspect(parse.input),
    theme: inspect(parse.theme),
    layer: inspect(parse.layer),
    patch: inspect(parse.patch),
  };
};
