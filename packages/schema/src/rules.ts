import type { Enum, Rule, Rules, Shape, Template } from "./types";

import { has, object } from "objectively";

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
 * Checks that a value is a token definition. A token definition is an object
 * that is not an array and has a `$value` member.
 */
const isDefinition = has("$value");

/**
 * Builds the runtime {@link Rules} for a template. The function makes a list
 * of rules for each kind with the atoms in `util`. The membership,
 * completeness, and reference checks read the sets in {@link Enum}. Each token
 * slot uses the value rule for its declared type in {@link Shape}. The value
 * rule accepts a reference to a token of that type or a structured value. The
 * composite kinds use the same value rules.
 *
 * @param enums - The token, modifier, context, and type sets of the template.
 * @param shape - The literal rule and the value rule for each token type.
 */
export const defineRules = <T extends Template>(
  enums: Enum<T>,
  shape: Shape,
): Rules => {
  /* $deprecated is a boolean flag or an explanatory string. */
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

  /* The atoms of a definition. */
  const definitionContainer = container("Definition");
  const definitionSubset = subset("Definition", enums.definitionKeys);
  const definitionSuperset = superset(
    "Definition",
    enums.requiredDefinitionKeys,
  );
  const definitionType = known("Type", enums.tokenTypes);
  const descriptionText = text("$description");
  const extensionsContainer = container("$extensions");

  /* A token definition has a known type, a value for that type, and metadata.
     The rule checks the value against the rule for the declared type. */
  const definition: Rule = (v) => {
    const notObject = definitionContainer(v);
    if (notObject) {
      return notObject;
    }
    if (!object(v)) {
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

  /* A partial override map is a subset of the tokens. The rule checks each
     value against the declared type of its token. The rule rejects a reference
     cycle among the entries of the map. */
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

  /* The edges of the reference graph are the tokens that a value names. */
  const definitionEdges = (entry: unknown): string[] => {
    if (isDefinition(entry)) {
      return collectRefs(entry.$value);
    }
    return [];
  };

  /* A complete token map has every token under a valid key. Each entry is a
     valid definition. The map has no reference cycle. */
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

  /* A literal value of any known type. */
  const literal = either(
    "Value",
    TYPES.map((type) => [shape[type].literal]),
  );
  const value = [literal];
  const binding = [valued(reference("Binding", enums.tokens), literal)];
  const id = [text("Identifier"), filled("Identifier")];
  const name = [text("Name"), filled("Name")];

  /* The context maps for each modifier. The complete map requires every
     context. The partial map requires no context. Each context holds a partial
     override map. */
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
  /* The order is a permutation of the modifiers. */
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
