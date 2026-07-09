import type { Rule } from "./types";

import { isObject } from "@untheme/common";

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
 * A single color component: a finite number or the `"none"` sentinel that
 * stands in for a missing channel.
 */
export const component: Rule = (v) => {
  if (v === NONE) {
    return;
  }
  return numeric("Color component")(v);
};

/**
 * A structured color: a known color space, its ordered components, an optional
 * alpha in the unit interval, and an optional hex fallback.
 */
export const literalColor: Rule = all([
  mismatch("color", (v) => isObject(v) && "colorSpace" in v),
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
 * A length: a numeric value carried by one of the known dimension units.
 */
export const literalDimension: Rule = all([
  mismatch("dimension", (v) => isObject(v) && "unit" in v),
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
 * A time span: a numeric value carried by one of the known duration units.
 */
export const literalDuration: Rule = all([
  mismatch("duration", (v) => isObject(v) && "unit" in v),
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
 * A font family: a single non-empty name or an ordered fallback stack, each
 * name barred from carrying a CSS breakout sequence.
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
 * A font weight: a number within the allowed range, or one of the named
 * weights in its place.
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
 * A plain number.
 */
export const literalNumber: Rule = numeric("Number");

/**
 * A cubic Bézier easing curve: exactly four finite numbers, the two abscissae
 * (entries 0 and 2) confined to the unit interval.
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
