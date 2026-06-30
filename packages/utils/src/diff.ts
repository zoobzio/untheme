import type { Overrides, Template, Theme } from "@untheme/schema";
import type { Diff } from "./types";

import { clone } from "./clone";

/**
 * The bindings in `to` that deviate from `from`: keys `to` holds whose values
 * differ.
 */
const delta = <R extends Record<string, string | undefined>>(
  from: R,
  to: R,
): Partial<R> =>
  Object.entries(to).reduce<Partial<R>>(
    (acc, [key, value]) =>
      from[key] === value ? acc : { ...acc, [key]: value },
    {},
  );

/**
 * Computes the patch that turns `from` into `to`: every binding `to` holds that
 * deviates from `from`, token by token and context by context. Identity and
 * order are not compared. Empty maps mean the themes bind identically; applying
 * the result to `from` via `merge` restores `to`.
 */
export const diff = <T extends Template>(
  from: Theme<T>,
  to: Theme<T>,
): Diff<T> => {
  const modifiers = clone(to).modifiers;
  const source: Record<string, Record<string, Overrides<T>>> = from.modifiers;
  const target: Record<string, Record<string, Overrides<T>>> = modifiers;
  for (const modifier of Object.keys(modifiers)) {
    for (const context of Object.keys(target[modifier])) {
      target[modifier][context] = delta(
        source[modifier][context],
        target[modifier][context],
      );
    }
  }
  return {
    tokens: delta(from.tokens, to.tokens),
    modifiers,
  };
};
