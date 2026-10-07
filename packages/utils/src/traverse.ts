import type {
  Context,
  Modifier,
  Modifiers,
  Overrides,
  Template,
} from "@untheme/schema";

import { remap } from "objectively";

/**
 * Makes a new modifiers structure. The function calls the callback for each
 * context of each modifier. The result has the same modifier keys and context
 * keys. The callback receives the function `at`. `at` reads the same modifier
 * and context in another modifiers structure. `at` returns the overrides, or
 * `undefined` when the other structure has no entry there.
 */
export const traverse = <T extends Template, R>(
  modifiers: Modifiers<T>,
  fn: (
    overrides: Overrides<T>,
    at: (other: {
      [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> };
    }) => Overrides<T> | undefined,
  ) => R,
): { [M in Modifier<T>]: { [C in Context<T, M>]: R } } =>
  remap<Modifiers<T>, { [M in Modifier<T>]: { [C in Context<T, M>]: R } }>(
    modifiers,
    <M extends Modifier<T>>(
      contexts: Modifiers<T>[M],
      modifier: M,
    ): { [C in Context<T, M>]: R } =>
      remap<Modifiers<T>[M], { [C in Context<T, M>]: R }>(
        contexts,
        (overrides, context) =>
          fn(overrides, (other) => other[modifier]?.[context]),
      ),
  );
