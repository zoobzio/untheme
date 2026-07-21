import type { Enum, Modifier, Template, Type } from "./types";

import { keys, map, remap } from "objectively";
import {
  COLOR_SPACE_SET,
  DEFINITION_KEY_SET,
  DIMENSION_UNIT_SET,
  DURATION_UNIT_SET,
  FONT_WEIGHT_SET,
  LINE_CAP_SET,
  REQUIRED_DEFINITION_KEY_SET,
  STROKE_STYLE_SET,
  THEME_KEY_SET,
  TOKEN_TYPE_SET,
} from "./scalar";

/**
 * Materializes the {@link Enum} for a template: the specification members
 * are shared across contracts, and the contract members are derived from the
 * template's own keys.
 *
 * @param base - The template whose keys define the contract.
 */
export const defineEnum = <T extends Template>(base: T): Enum<T> => {
  const tokens = new Set(keys(base.tokens));
  const modifiers = new Set(keys(base.modifiers));

  const contexts = remap<T["modifiers"], Enum<T>["contexts"]>(
    base.modifiers,
    <M extends Modifier<T>>(
      context: T["modifiers"][M],
    ): Enum<T>["contexts"][M] => new Set(keys(context)),
  );
  const types = map<T["tokens"], Type>(
    base.tokens,
    (definition) => definition.$type,
  );

  return {
    tokens,
    modifiers,
    contexts,
    types,
    tokenTypes: TOKEN_TYPE_SET,
    colorSpaces: COLOR_SPACE_SET,
    dimensionUnits: DIMENSION_UNIT_SET,
    durationUnits: DURATION_UNIT_SET,
    fontWeights: FONT_WEIGHT_SET,
    strokeStyles: STROKE_STYLE_SET,
    lineCaps: LINE_CAP_SET,
    definitionKeys: DEFINITION_KEY_SET,
    requiredDefinitionKeys: REQUIRED_DEFINITION_KEY_SET,
    themeKeys: THEME_KEY_SET,
  };
};
