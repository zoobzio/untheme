import type {
  Input,
  Open,
  Schema,
  Template,
  Theme,
  Token,
  Type,
  Untheme,
  Values,
} from "untheme";
import type { SelectionsOptions } from "./types";

import { defineSchema } from "untheme";

import { bootUntheme } from "./boot";
import { mockInput } from "./input";

/**
 * Every token of a theme, fully dereferenced.
 */
export type Resolved<T extends Template> = {
  [K in Token<T>]: Values<Open>[Type];
};

/**
 * Returns the selections to check a theme at. The first is the boot
 * selection, with each modifier at its first context. The rest are the
 * single-context deviations from it, one modifier at a time. With
 * `exhaustive`, the function returns every combination of contexts across
 * every modifier. At preset scale that is tens of thousands, so use it only
 * where the axes interact.
 *
 * @param theme - The theme whose contexts to walk.
 * @param options - Whether to walk every combination.
 */
export const selections = <T extends Template>(
  theme: T,
  options: SelectionsOptions = {},
): Input<T>[] => {
  if (options.exhaustive) {
    let partials: Record<string, string>[] = [{}];
    for (const modifier of theme.order) {
      const contexts = Object.keys(theme.modifiers[modifier] ?? {});
      partials = partials.flatMap((partial) =>
        contexts.map((context) => ({ ...partial, [modifier]: context })),
      );
    }
    return partials as Input<T>[];
  }
  const base: Record<string, string> = mockInput(theme);
  const found: Record<string, string>[] = [base];
  for (const modifier of theme.order) {
    for (const context of Object.keys(theme.modifiers[modifier] ?? {})) {
      if (context !== base[modifier]) {
        found.push({ ...base, [modifier]: context });
      }
    }
  }
  return found as Input<T>[];
};

/**
 * Returns every token of a service resolved to its final value. The function
 * resolves at the active selection, or at the given selection. It restores
 * the active selection after. The result is one flat record, for a snapshot
 * or an equality check of a whole theme.
 *
 * @param untheme - The service to resolve through.
 * @param selection - The selection to resolve at. The active one by default.
 * @throws Error when a token fails to resolve. The message names the token
 * and the selection. The cause is the error of the service.
 */
export const resolveAll = <T extends Template>(
  untheme: Untheme<T>,
  selection?: Input<T>,
): Resolved<T> => {
  const previous = untheme.config.input;
  if (selection) {
    untheme.config.input = selection;
  }
  try {
    const resolved: Partial<Record<string, Values<Open>[Type]>> = {};
    for (const token of Object.keys(untheme.theme().tokens)) {
      try {
        resolved[token] = untheme.resolve(token as Token<T>);
      } catch (error) {
        throw new Error(
          `@untheme/testing: "${token}" fails to resolve at ${JSON.stringify(untheme.config.input)}`,
          { cause: error },
        );
      }
    }
    return resolved as Resolved<T>;
  } finally {
    untheme.config.input = previous;
  }
};

/**
 * Checks that a theme is sound. The theme must satisfy the untheme schema. A
 * service must boot over it. Every token must resolve at every selection that
 * {@link selections} lists. This is the first test for a theme built by hand
 * or for the tokens of a preset read in as JSON.
 *
 * @param theme - The theme to check.
 * @param options - Whether to check every combination of contexts.
 * @throws SchemaError when the theme violates the contract.
 * @throws Error when a token fails to resolve. The message names the token
 * and the selection.
 */
export const proveTheme = <T extends Theme<T>>(
  theme: T,
  options: SelectionsOptions = {},
): void => {
  const schema: Schema<T> = defineSchema(theme);
  schema.assert.theme(theme);
  const untheme = bootUntheme(theme);
  for (const selection of selections(theme, options)) {
    resolveAll(untheme, selection);
  }
};
