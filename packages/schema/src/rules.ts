import type { Rule, Rules, Template } from "./types";

import { CSS_BREAKOUT } from "./constant";
import {
  acyclic,
  balanced,
  breakout,
  container,
  each,
  either,
  filled,
  list,
  member,
  reference,
  shape,
  subset,
  superset,
  text,
} from "./util";

/**
 * Derives a template's runtime {@link Rules}: the token, modifier, and
 * per-modifier context {@link Set}s, plus a list of rules per kind composed from
 * the atoms in `util`. The scalar rule lists double as building blocks the
 * composite kinds reuse — every token value is a binding, a context carries a
 * partial override map, and a modifier carries a map of contexts.
 *
 * @param base - The template whose keys define the token contract.
 */
export const defineRules = <T extends Template>(base: T): Rules<T> => {
  const tokens = new Set(Object.keys(base.tokens));
  const modifiers = new Set(Object.keys(base.modifiers));
  const contexts: Record<string, Set<string>> = {};
  for (const modifier of Object.keys(base.modifiers)) {
    contexts[modifier] = new Set(Object.keys(base.modifiers[modifier]));
  }

  const value = [
    text("Token value"),
    filled("Token value"),
    breakout("Token value", CSS_BREAKOUT),
    balanced("Token value"),
  ];
  const references = [reference("Reference", tokens)];
  const binding = [either("Binding", [references, value])];
  const id = [text("Identifier"), filled("Identifier")];
  const name = [text("Name"), filled("Name")];

  // A partial override map: a subset of tokens, each value a binding.
  const overrides = [
    container("Overrides"),
    subset("Overrides", tokens),
    each(binding),
  ];
  // A complete token map: every token present, each value a binding, no cycles.
  const tokensRule = [
    container("Tokens"),
    subset("Tokens", tokens),
    each(binding),
    superset("Tokens", tokens),
    acyclic("Tokens", tokens),
  ];

  // Per-modifier context maps: each modifier's contexts validated against its
  // own context set. Complete requires every context; partial does not.
  const completeFields: Record<string, Rule[]> = {};
  const partialFields: Record<string, Rule[]> = {};
  const inputFields: Record<string, Rule[]> = {};
  for (const modifier of Object.keys(base.modifiers)) {
    const ctx = contexts[modifier];
    completeFields[modifier] = [
      container("Contexts"),
      subset("Contexts", ctx),
      each(overrides),
      superset("Contexts", ctx),
    ];
    partialFields[modifier] = [
      container("Contexts"),
      subset("Contexts", ctx),
      each(overrides),
    ];
    inputFields[modifier] = [member("Context", ctx)];
  }

  const completeModifiers = [
    container("Modifiers"),
    shape("Modifiers", completeFields),
    superset("Modifiers", modifiers),
  ];
  const partialModifiers = [
    container("Modifiers"),
    shape("Modifiers", partialFields),
  ];
  const order = [list("Order", [member("Modifier", modifiers)])];

  return {
    sets: { tokens, modifiers, contexts },
    rules: {
      modifier: [text("Modifier"), member("Modifier", modifiers)],
      value,
      token: [text("Token"), member("Token", tokens)],
      reference: references,
      binding,
      overrides,
      tokens: tokensRule,
      modifiers: completeModifiers,
      order,
      input: [
        container("Input"),
        shape("Input", inputFields),
        superset("Input", modifiers),
      ],
      theme: [
        container("Theme"),
        shape("Theme", {
          id,
          name,
          tokens: tokensRule,
          modifiers: completeModifiers,
          order,
        }),
        superset(
          "Theme",
          new Set(["id", "name", "tokens", "modifiers", "order"]),
        ),
      ],
      layer: [
        container("Layer"),
        shape("Layer", {
          id,
          name,
          tokens: overrides,
          modifiers: partialModifiers,
          order,
        }),
        superset("Layer", new Set(["id", "name"])),
      ],
      patch: [
        container("Patch"),
        shape("Patch", { tokens: overrides, modifiers: partialModifiers }),
      ],
    },
  };
};
