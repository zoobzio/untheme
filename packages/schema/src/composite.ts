import type { Rule } from "./types";

import { LINE_CAP_SET, STROKE_STYLE_SET } from "./scalar";
import { object } from "objectively";

import { all, list, member, mismatch, struct, valued } from "./util";

/**
 * A stroke style: a keyword form, or a dash object whose dash lengths are
 * dimensions or references and whose caps name one of the line caps.
 *
 * @param dimension - The value rule for a dimension, guarding each dash length.
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
 * A border: a color, a width, and a stroke style, each accepting a value or a
 * reference in its slot.
 *
 * @param color - The value rule for a color, guarding the color slot.
 * @param dimension - The value rule for a dimension, guarding the width slot.
 * @param strokeStyle - The value rule for a stroke style, guarding the style
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
 * A transition: a duration, a delay, and a timing function, each accepting a
 * value or a reference in its slot.
 *
 * @param duration - The value rule for a duration, guarding the duration and
 *   delay slots.
 * @param cubicBezier - The value rule for a cubic Bézier curve, guarding the
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
 * A shadow: a single drop-shadow object, or a list whose every element is a
 * shadow object or a reference. Each object's color and four dimensions accept
 * a value or a reference in its slot.
 *
 * @param color - The value rule for a color, guarding the color slot.
 * @param dimension - The value rule for a dimension, guarding the four
 *   dimension slots.
 * @param reference - The value rule for a reference to a shadow token, accepted
 *   as a list element in place of an object.
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
 * A gradient: a list of stops, each stop a color and a position that accept a
 * value or a reference in its slot.
 *
 * @param color - The value rule for a color, guarding each stop's color slot.
 * @param number - The value rule for a number, guarding each stop's position
 *   slot.
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
 * A typography set: family, size, weight, letter spacing, and line height,
 * each accepting a value or a reference in its slot.
 *
 * @param fontFamily - The value rule for a font family, guarding the family
 *   slot.
 * @param dimension - The value rule for a dimension, guarding the font size and
 *   letter spacing slots.
 * @param fontWeight - The value rule for a font weight, guarding the weight
 *   slot.
 * @param number - The value rule for a number, guarding the line height slot.
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
