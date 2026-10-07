import type { Rule } from "./types";

import { object } from "objectively";

import {
  COLOR_SPACES,
  CSS_BREAKOUT,
  DEFINITION_KEYS,
  DIMENSION_UNITS,
  DURATION_UNITS,
  FONT_WEIGHT_MAX,
  FONT_WEIGHT_MIN,
  FONT_WEIGHTS,
  LINE_CAPS,
  NONE,
  REQUIRED_DEFINITION_KEYS,
  STROKE_STYLES,
  THEME_KEYS,
  TYPES,
} from "./constant";
import {
  all,
  breakout,
  filled,
  hexColor,
  list,
  member,
  mismatch,
  nest,
  numeric,
  range,
  struct,
  text,
} from "./util";

export const TOKEN_TYPE_SET = new Set(TYPES);
export const COLOR_SPACE_SET = new Set(COLOR_SPACES);
export const DIMENSION_UNIT_SET = new Set(DIMENSION_UNITS);
export const DURATION_UNIT_SET = new Set(DURATION_UNITS);
export const FONT_WEIGHT_SET = new Set(FONT_WEIGHTS);
export const STROKE_STYLE_SET = new Set(STROKE_STYLES);
export const LINE_CAP_SET = new Set(LINE_CAPS);
export const DEFINITION_KEY_SET = new Set(DEFINITION_KEYS);
export const REQUIRED_DEFINITION_KEY_SET = new Set(REQUIRED_DEFINITION_KEYS);
export const THEME_KEY_SET = new Set(THEME_KEYS);

/**
 * Checks a color component. A component is a finite number or the `"none"`
 * keyword for a missing channel.
 */
export const component: Rule = (v) => {
  if (v === NONE) {
    return;
  }
  return numeric("Color component")(v);
};

/**
 * Checks a structured color. A color has a known color space and an ordered
 * array of components. A color can have an alpha from 0 to 1 and a hex value.
 */
export const literalColor: Rule = all([
  mismatch("color", (v) => object(v) && "colorSpace" in v),
  struct(
    "color",
    {
      colorSpace: [member("Color space", COLOR_SPACE_SET)],
      components: [list("Color components", [component])],
      alpha: [numeric("Alpha"), range("Alpha", 0, 1)],
      hex: [text("Color hex"), hexColor("Color hex")],
    },
    new Set(["colorSpace", "components"]),
  ),
]);

/**
 * Checks a dimension. A dimension has a numeric value and a known dimension
 * unit.
 */
export const literalDimension: Rule = all([
  mismatch("dimension", (v) => object(v) && "unit" in v),
  struct(
    "dimension",
    {
      value: [numeric("Dimension value")],
      unit: [member("Dimension unit", DIMENSION_UNIT_SET)],
    },
    new Set(["value", "unit"]),
  ),
]);

/**
 * Checks a duration. A duration has a numeric value and a known duration
 * unit.
 */
export const literalDuration: Rule = all([
  mismatch("duration", (v) => object(v) && "unit" in v),
  struct(
    "duration",
    {
      value: [numeric("Duration value")],
      unit: [member("Duration unit", DURATION_UNIT_SET)],
    },
    new Set(["value", "unit"]),
  ),
]);

/**
 * Checks a font family. A font family is one name or an ordered array of
 * names. Each name has text and contains no CSS breakout sequence.
 */
export const literalFontFamily: Rule = (v) => {
  if (typeof v === "string") {
    return all([filled("Font family"), breakout("Font family", CSS_BREAKOUT)])(
      v,
    );
  }
  if (Array.isArray(v)) {
    return list("Font family", [
      text("Font family"),
      filled("Font family"),
      breakout("Font family", CSS_BREAKOUT),
    ])(v);
  }
  return mismatch("font family", () => false)(v);
};

/**
 * Checks a font weight. A font weight is a number in the allowed range or a
 * named weight.
 */
export const literalFontWeight: Rule = (v) => {
  if (typeof v === "number") {
    return all([
      numeric("Font weight"),
      range("Font weight", FONT_WEIGHT_MIN, FONT_WEIGHT_MAX),
    ])(v);
  }
  if (typeof v === "string") {
    return member("Font weight", FONT_WEIGHT_SET)(v);
  }
  return mismatch("font weight", () => false)(v);
};

/**
 * Checks a number.
 */
export const literalNumber: Rule = numeric("Number");

/**
 * Checks a cubic Bézier easing curve. The curve is an array of four finite
 * numbers. The numbers at index 0 and index 2 are from 0 to 1.
 */
export const literalCubicBezier: Rule = (v) => {
  if (!Array.isArray(v)) {
    return mismatch("cubic bezier", () => false)(v);
  }
  if (v.length !== 4) {
    return {
      code: "bad_length",
      message: "Cubic bezier must have exactly 4 entries.",
      expected: 4,
      received: v.length,
    };
  }
  for (const [index, entry] of v.entries()) {
    const notNumber = numeric("Cubic bezier")(entry);
    if (notNumber) {
      return nest(String(index), notNumber);
    }
    if (index === 0 || index === 2) {
      const outOfRange = range("Cubic bezier abscissa", 0, 1)(entry);
      if (outOfRange) {
        return nest(String(index), outOfRange);
      }
    }
  }
};
