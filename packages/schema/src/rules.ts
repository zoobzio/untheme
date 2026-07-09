import type { Enum, Rule, Rules, Shape, Template } from "./types";

import { isDefinition, isObject } from "@untheme/common";

import { CSS_BREAKOUT, TYPES } from "./constant";
import {
  acyclic,
  breakout,
  collectRefs,
  container,
  each,
  either,
  exhaustive,
  filled,
  keyed,
  keys,
  known,
  list,
  member,
  nest,
  fields,
  reference,
  struct,
  subset,
  superset,
  text,
  unique,
  valued,
} from "./util";

/**
 * Composes a template's runtime {@link Rules}: a list of rules per kind built
 * from the atoms in `util`. Membership, completeness, and reference checks read
 * the template's sets off {@link Enum}; every token slot resolves to the
 * value rule for its declared type in {@link Shape} — a reference to a token
 * of that type, or a structured value in place — and the composite kinds reuse
 * those rules.
 *
 * @param enums - The template's token, modifier, context, and type sets.
 * @param shape - The literal and value rule for each token type.
 */
export const defineRules = <T extends Template>(
  enums: Enum<T>,
  shape: Shape,
): Rules => {
  /* $deprecated is inert: a boolean flag or an explanatory string. */
  const deprecated: Rule = (v) => {
    if (typeof v === "boolean" || typeof v === "string") {
      return;
    }
    return {
      code: "not_boolean",
      message: "$deprecated must be a boolean or a string.",
      received: v,
    };
  };

  /* The atoms a definition composes, built once and shared across calls. */
  const definitionContainer = container("Definition");
  const definitionSubset = subset("Definition", enums.definitionKeys);
  const definitionSuperset = superset(
    "Definition",
    enums.requiredDefinitionKeys,
  );
  const definitionType = known("Type", enums.tokenTypes);
  const descriptionText = text("$description");
  const extensionsContainer = container("$extensions");

  /* A single token definition: a known type, a value valid for that type, and
     inert metadata. The $type/$value correlation is resolved here — the value
     is checked against the rule for its own declared type. */
  const definition: Rule = (v) => {
    const notObject = definitionContainer(v);
    if (notObject) {
      return notObject;
    }
    if (!isObject(v)) {
      return;
    }
    const stray = definitionSubset(v);
    if (stray) {
      return stray;
    }
    const missing = definitionSuperset(v);
    if (missing) {
      return missing;
    }
    const badType = definitionType(v.$type);
    if (badType) {
      return nest("$type", badType);
    }
    const declared = TYPES.find((type) => type === v.$type);
    if (declared) {
      const badValue = shape[declared].value(v.$value);
      if (badValue) {
        return nest("$value", badValue);
      }
    }
    if ("$description" in v) {
      const badDescription = descriptionText(v.$description);
      if (badDescription) {
        return nest("$description", badDescription);
      }
    }
    if ("$deprecated" in v) {
      const badDeprecated = deprecated(v.$deprecated);
      if (badDeprecated) {
        return nest("$deprecated", badDeprecated);
      }
    }
    if ("$extensions" in v) {
      const badExtensions = extensionsContainer(v.$extensions);
      if (badExtensions) {
        return nest("$extensions", badExtensions);
      }
    }
  };

  /* A partial override map: a subset of tokens, each rebinding its value
     against that token's declared type, with no reference cycle among the
     map's own entries — those win composition together, so such a cycle can
     never resolve. References that leave the map are a resolution-time
     concern. */
  const overrideRules: Record<string, Rule[]> = {};
  for (const token of enums.tokens) {
    overrideRules[token] = [shape[enums.types[token]].value];
  }
  const overridePicker = (key: string): Rule[] => {
    return overrideRules[key] ?? [];
  };
  const overrides = [
    container("Overrides"),
    subset("Overrides", enums.tokens),
    keyed(overridePicker),
    acyclic("Overrides", enums.tokens, collectRefs),
  ];

  /* Edges of the reference graph: the tokens a definition's value names. */
  const definitionEdges = (entry: unknown): string[] => {
    if (isDefinition(entry)) {
      return collectRefs(entry.$value);
    }
    return [];
  };

  /* A complete token map: every token present under a well-formed key, each a
     valid definition, no reference cycles. */
  const tokensRule = [
    container("Tokens"),
    keys("Tokens", [
      filled("Token name"),
      breakout("Token name", CSS_BREAKOUT),
    ]),
    subset("Tokens", enums.tokens),
    superset("Tokens", enums.tokens),
    each([definition]),
    acyclic("Tokens", enums.tokens, definitionEdges),
  ];

  /* A single reference or a literal value of some known type. */
  const value = [
    either(
      "Value",
      TYPES.map((type) => [shape[type].literal]),
    ),
  ];
  const binding = [valued(reference("Binding", enums.tokens), value[0])];
  const id = [text("Identifier"), filled("Identifier")];
  const name = [text("Name"), filled("Name")];

  /* Per-modifier context maps. Complete requires every context; partial does
     not. Each context carries a partial override map. */
  const completeFields: Record<string, Rule[]> = {};
  const partialFields: Record<string, Rule[]> = {};
  const inputFields: Record<string, Rule[]> = {};
  for (const modifier of enums.modifiers) {
    const ctx = enums.contexts[modifier];
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
    struct("Modifiers", completeFields, enums.modifiers),
  ];
  const partialModifiers = [
    container("Modifiers"),
    fields("Modifiers", partialFields),
  ];
  /* Composition precedence: an exact permutation of the axes. */
  const order = [
    list("Order", [member("Modifier", enums.modifiers)]),
    unique("Order"),
    exhaustive("Order", enums.modifiers),
  ];

  return {
    modifier: [text("Modifier"), member("Modifier", enums.modifiers)],
    value,
    token: [text("Token"), member("Token", enums.tokens)],
    reference: [reference("Reference", enums.tokens)],
    binding,
    definition: [definition],
    overrides,
    tokens: tokensRule,
    modifiers: completeModifiers,
    order,
    input: [container("Input"), struct("Input", inputFields, enums.modifiers)],
    theme: [
      container("Theme"),
      struct(
        "Theme",
        {
          id,
          name,
          tokens: tokensRule,
          modifiers: completeModifiers,
          order,
        },
        enums.themeKeys,
      ),
    ],
    layer: [
      container("Layer"),
      struct(
        "Layer",
        {
          id,
          name,
          tokens: overrides,
          modifiers: partialModifiers,
          order,
        },
        new Set(["id", "name"]),
      ),
    ],
    patch: [
      container("Patch"),
      fields("Patch", { tokens: overrides, modifiers: partialModifiers }),
    ],
  };
};
