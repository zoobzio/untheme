import type { Inspect, Parse, Result, Template } from "./types";

import { SchemaError } from "./error";

/**
 * Builds the {@link Inspect} bundle: each kind runs its {@link Parse} and
 * captures the outcome as a {@link Result} instead of throwing — success with
 * the narrowed value, failure with the issues. Any non-{@link SchemaError}
 * propagates.
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
