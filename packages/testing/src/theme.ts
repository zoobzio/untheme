import type {
  Authored,
  Binding,
  Contract,
  Schema,
  Template,
  Type,
} from "untheme";
import type { ModifierSpec, Shape, Terse, ThemeSpec } from "./types";

import { defineSchema } from "untheme";

import { InvalidSpecError } from "./error";
import { binding, definition } from "./value";

/**
 * Builds a complete theme from a terse spec. The theme is the fixture that
 * the other helpers work from, in place of a kit build. Each token is a
 * {@link Terse} value. A hex string is a color, `"8px"` is a dimension, and a
 * `{reference}` has the type of its target. Each modifier context rebinds
 * tokens the same way. The result is typed as a `Contract` over the token
 * and modifier names of the spec, so a service over it autocompletes them.
 * The schema checks the theme before the function returns it. A reference to
 * a token that the spec lacks, or an override of the wrong type, fails here
 * and not in the test that uses the theme.
 *
 * @param spec - The tokens, modifiers, order, and identity.
 * @throws InvalidSpecError when a value is in no known form, a reference
 * names no token, or a reference chain never reaches a typed token.
 * @throws SchemaError when the theme violates the contract.
 */
export const mockTheme = <
  Tok extends string,
  Mod extends ModifierSpec<Tok> = Record<never, never>,
>(
  spec: ThemeSpec<Tok, Mod>,
): Contract<Tok, Shape<Mod>> => {
  const tokens: Record<string, Authored> = {};
  const pending: Record<string, `{${string}}`> = {};
  for (const [name, value] of Object.entries<Terse>(spec.tokens)) {
    const parsed = definition(name, value);
    if (typeof parsed === "string") {
      pending[name] = parsed;
    } else {
      tokens[name] = parsed;
    }
  }

  /**
   * Returns the type of a token by name. A typed token returns its own type.
   * A reference returns the type of its target. The function follows the
   * references until it reaches a typed token.
   */
  const typeOf = (name: string, trail: string[]): Type => {
    const typed = tokens[name];
    if (typed) {
      return typed.$type;
    }
    const reference = pending[name];
    if (reference === undefined) {
      throw new InvalidSpecError(
        `"${trail[0]}" references "${name}", which the spec does not define`,
      );
    }
    const target = reference.slice(1, -1);
    if (trail.includes(target)) {
      throw new InvalidSpecError(
        `"${trail[0]}" references itself through ${[...trail, target].join(" → ")} — no token in the cycle carries a type`,
      );
    }
    return typeOf(target, [...trail, target]);
  };

  for (const [name, reference] of Object.entries(pending)) {
    tokens[name] = { $type: typeOf(name, [name]), $value: reference };
  }

  const declared: ModifierSpec<string> = spec.modifiers ?? {};
  const modifiers: Record<string, Record<string, Record<string, Binding>>> = {};
  for (const [modifier, contexts] of Object.entries(declared)) {
    modifiers[modifier] = {};
    for (const [context, overrides] of Object.entries(contexts)) {
      const bound: Record<string, Binding> = {};
      for (const [name, value] of Object.entries(overrides)) {
        if (value !== undefined) {
          bound[name] = binding(name, value);
        }
      }
      modifiers[modifier][context] = bound;
    }
  }

  const theme: Template = {
    id: spec.id ?? "mock",
    name: spec.name ?? "Mock",
    tokens,
    modifiers,
    order: spec.order ?? Object.keys(modifiers),
  };
  const schema: Schema<Template> = defineSchema<Template>(theme);
  schema.assert.theme(theme);
  return theme as unknown as Contract<Tok, Shape<Mod>>;
};
