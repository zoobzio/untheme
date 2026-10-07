import type { Rule } from "./types";

import { LINE_CAP_SET, STROKE_STYLE_SET } from "./scalar";
import { object } from "objectively";

import { all, list, member, mismatch, struct, valued } from "./util";

/**
 * Makes the rule for a stroke style. A stroke style is a keyword or a dash
 * object. The dash object has an array of dash lengths and a line cap. Each
 * dash length is a dimension or a reference.
 *
 * @param dimension - The value rule for a dimension, used for each dash length.
 */
export const strokeStyleOf =
  (dimension: Rule): Rule =>
  (v) => {
    if (typeof v === "string") {
      return member("Stroke style", STROKE_STYLE_SET)(v);
    }
    if (object(v)) {
      return struct(
        "stroke style",
        {
          dashArray: [list("Dash array", [dimension])],
          lineCap: [member("Line cap", LINE_CAP_SET)],
        },
        new Set(["dashArray", "lineCap"]),
      )(v);
    }
    return mismatch("stroke style", () => false)(v);
  };

/**
 * Makes the rule for a border. A border has a color, a width, and a stroke
 * style. Each slot accepts a value or a reference.
 *
 * @param color - The value rule for a color, used for the color slot.
 * @param dimension - The value rule for a dimension, used for the width slot.
 * @param strokeStyle - The value rule for a stroke style, used for the style
 *   slot.
 */
export const borderOf = (
  color: Rule,
  dimension: Rule,
  strokeStyle: Rule,
): Rule =>
  all([
    mismatch("border", (v) => object(v) && "width" in v),
    struct(
      "border",
      {
        color: [color],
        width: [dimension],
        style: [strokeStyle],
      },
      new Set(["color", "width", "style"]),
    ),
  ]);

/**
 * Makes the rule for a transition. A transition has a duration, a delay, and a
 * timing function. Each slot accepts a value or a reference.
 *
 * @param duration - The value rule for a duration, used for the duration and
 *   delay slots.
 * @param cubicBezier - The value rule for a cubic Bézier curve, used for the
 *   timing function slot.
 */
export const transitionOf = (duration: Rule, cubicBezier: Rule): Rule =>
  all([
    mismatch("transition", (v) => object(v) && "timingFunction" in v),
    struct(
      "transition",
      {
        duration: [duration],
        delay: [duration],
        timingFunction: [cubicBezier],
      },
      new Set(["duration", "delay", "timingFunction"]),
    ),
  ]);

/**
 * Makes the rule for a shadow. A shadow is one shadow object or a list. Each
 * element of the list is a shadow object or a reference. A shadow object has a
 * color and four dimensions. Each slot accepts a value or a reference.
 *
 * @param color - The value rule for a color, used for the color slot.
 * @param dimension - The value rule for a dimension, used for the four
 *   dimension slots.
 * @param reference - The value rule for a reference to a shadow token. A list
 *   element can use it in place of an object.
 */
export const shadowOf = (
  color: Rule,
  dimension: Rule,
  reference: Rule,
): Rule => {
  const single = all([
    mismatch("shadow", (v) => object(v) && "offsetX" in v),
    struct(
      "shadow",
      {
        color: [color],
        offsetX: [dimension],
        offsetY: [dimension],
        blur: [dimension],
        spread: [dimension],
      },
      new Set(["color", "offsetX", "offsetY", "blur", "spread"]),
    ),
  ]);
  const element = valued(reference, single);
  return (v) => {
    if (Array.isArray(v)) {
      return list("Shadow list", [element])(v);
    }
    return single(v);
  };
};

/**
 * Makes the rule for a gradient. A gradient is a list of stops. Each stop has
 * a color and a position. Each slot accepts a value or a reference.
 *
 * @param color - The value rule for a color, used for the color slot of each
 *   stop.
 * @param number - The value rule for a number, used for the position slot of
 *   each stop.
 */
export const gradientOf = (color: Rule, number: Rule): Rule => {
  const stop: Rule = all([
    mismatch(
      "gradient stop",
      (v) => object(v) && ("color" in v || "position" in v),
    ),
    struct(
      "gradient stop",
      {
        color: [color],
        position: [number],
      },
      new Set(["color", "position"]),
    ),
  ]);
  return (v) => {
    if (!Array.isArray(v)) {
      return mismatch("gradient", () => false)(v);
    }
    return list("Gradient", [stop])(v);
  };
};

/**
 * Makes the rule for a typography set. A typography set has a family, a size,
 * a weight, a letter spacing, and a line height. Each slot accepts a value or
 * a reference.
 *
 * @param fontFamily - The value rule for a font family, used for the family
 *   slot.
 * @param dimension - The value rule for a dimension, used for the font size and
 *   letter spacing slots.
 * @param fontWeight - The value rule for a font weight, used for the weight
 *   slot.
 * @param number - The value rule for a number, used for the line height slot.
 */
export const typographyOf = (
  fontFamily: Rule,
  dimension: Rule,
  fontWeight: Rule,
  number: Rule,
): Rule =>
  all([
    mismatch("typography", (v) => object(v) && "fontSize" in v),
    struct(
      "typography",
      {
        fontFamily: [fontFamily],
        fontSize: [dimension],
        fontWeight: [fontWeight],
        letterSpacing: [dimension],
        lineHeight: [number],
      },
      new Set([
        "fontFamily",
        "fontSize",
        "fontWeight",
        "letterSpacing",
        "lineHeight",
      ]),
    ),
  ]);
