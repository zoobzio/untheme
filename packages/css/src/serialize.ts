import type { Shadow, Open, Type } from "@untheme/schema";
import type { Inputs } from "./types";

import { wrapped } from "objectively";

import { FONT_WEIGHT_NUMBERS, RESERVED_FAMILY_NAMES } from "./constant";
import { indirection, property } from "./property";

/**
 * A reference is a string wrapped in `{` and `}`.
 */
const isReference = wrapped("{", "}");

const channel = (value: number | "none"): string => {
  return String(value);
};

/**
 * Serializes a channel as a percentage. `hsl()` and `hwb()` use percentages for
 * the second and third components.
 */
const percentage = (value: number | "none"): string => {
  if (value === "none") {
    return "none";
  }
  return `${value}%`;
};

/**
 * Serializes a structured color. The function returns the hex fallback when
 * present. Otherwise the function returns the function of the color space.
 * `hsl` and `hwb` use percentage components. `lab`, `lch`, `oklab`, and `oklch`
 * use their own names. All other spaces use `color()`.
 */
const color = (value: Inputs["color"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  if (value.hex) {
    return value.hex;
  }
  let alpha = "";
  if (value.alpha !== undefined) {
    alpha = ` / ${value.alpha}`;
  }
  const space = value.colorSpace;
  if (space === "hsl" || space === "hwb") {
    const parts = value.components.map((component, index) => {
      if (index === 0) {
        return channel(component);
      }
      return percentage(component);
    });
    return `${space}(${parts.join(" ")}${alpha})`;
  }
  const body = value.components.map(channel).join(" ");
  if (
    space === "lab" ||
    space === "lch" ||
    space === "oklab" ||
    space === "oklch"
  ) {
    return `${space}(${body}${alpha})`;
  }
  return `color(${space} ${body}${alpha})`;
};

/**
 * Serializes a value and its unit. The function serves the `dimension` and
 * `duration` types and each dimension slot in a composite value.
 */
const measure = (value: Inputs["dimension"] | Inputs["duration"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${value.value}${value.unit}`;
};

/**
 * Serializes a family name. The function returns a plain ident bare. The
 * function quotes any other name and any reserved word, and escapes quotes and
 * backslashes.
 */
const familyName = (value: string): string => {
  if (
    /^[a-zA-Z-][a-zA-Z0-9-]*$/.test(value) &&
    !RESERVED_FAMILY_NAMES.has(value.toLowerCase())
  ) {
    return value;
  }
  return `"${value.replace(/["\\]/g, (found) => `\\${found}`)}"`;
};

/**
 * Serializes one name or an ordered fallback stack joined by commas.
 */
const fontFamily = (value: Inputs["fontFamily"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  if (Array.isArray(value)) {
    return value.map(familyName).join(", ");
  }
  return familyName(value);
};

/**
 * Serializes a font weight. A number stays a number. A named weight becomes its
 * numeric value.
 */
const fontWeight = (value: Inputs["fontWeight"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  if (typeof value === "number") {
    return String(value);
  }
  return String(FONT_WEIGHT_NUMBERS[value]);
};

const number = (value: Inputs["number"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return String(value);
};

const cubicBezier = (value: Inputs["cubicBezier"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `cubic-bezier(${value.join(", ")})`;
};

/**
 * Serializes a stroke style. A keyword passes through. A dash object becomes
 * `dashed`.
 */
const strokeStyle = (value: Inputs["strokeStyle"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  if (typeof value === "string") {
    return value;
  }
  return "dashed";
};

/**
 * Serializes a border as the `border` shorthand with width, style, and color.
 */
const border = (value: Inputs["border"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${measure(value.width)} ${strokeStyle(value.style)} ${color(value.color)}`;
};

/**
 * Serializes a transition as the `transition` shorthand with duration, timing
 * function, and delay. The declaration applies to `all` properties.
 */
const transition = (value: Inputs["transition"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${measure(value.duration)} ${cubicBezier(value.timingFunction)} ${measure(value.delay)}`;
};

/**
 * Serializes one shadow with offsets, blur, spread, and color.
 */
const shadowLayer = (value: Shadow<Open> | `{${string}}`): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return [
    measure(value.offsetX),
    measure(value.offsetY),
    measure(value.blur),
    measure(value.spread),
    color(value.color),
  ].join(" ");
};

/**
 * Serializes one layer or a comma-joined stack of layers.
 */
const shadow = (value: Inputs["shadow"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  if (Array.isArray(value)) {
    return value.map(shadowLayer).join(", ");
  }
  return shadowLayer(value);
};

/**
 * Serializes a gradient stop position as a percentage. A reference becomes
 * `calc()` with the `var()` times `100%`.
 */
const position = (value: number | `{${string}}`): string => {
  if (isReference(value)) {
    return `calc(${indirection(value)} * 100%)`;
  }
  return `${value * 100}%`;
};

/**
 * Serializes a gradient as `linear-gradient()` over its stops in the default
 * direction.
 */
const gradient = (value: Inputs["gradient"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  const stops = value.map((stop) => {
    return `${color(stop.color)} ${position(stop.position)}`;
  });
  return `linear-gradient(${stops.join(", ")})`;
};

/**
 * Serializes a typography set as the `font` shorthand with weight, size over
 * line height, and family. Letter spacing is a sibling declaration. See
 * `siblings`.
 */
const typography = (value: Inputs["typography"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${fontWeight(value.fontWeight)} ${measure(value.fontSize)}/${number(value.lineHeight)} ${fontFamily(value.fontFamily)}`;
};

/**
 * Serializes the letter spacing of a typography set for the sibling
 * declaration. A whole-value reference points to the `-letter-spacing` property
 * of the target.
 */
const letterSpacing = (value: Inputs["typography"]): string => {
  if (isReference(value)) {
    return `var(${property(value.slice(1, -1))}-letter-spacing)`;
  }
  return measure(value.letterSpacing);
};

const serializers: { [Y in Type]: (value: Inputs[Y]) => string } = {
  color,
  dimension: measure,
  duration: measure,
  fontFamily,
  fontWeight,
  number,
  cubicBezier,
  strokeStyle,
  border,
  transition,
  shadow,
  gradient,
  typography,
};

/**
 * The sibling function for a type with no sibling declarations.
 */
const none = () => {
  return {};
};

/**
 * The sibling declarations of each token type, keyed by the suffix of the
 * property name. Only typography has a sibling, `<name>-letter-spacing`.
 */
const siblings: {
  [Y in Type]: (value: Inputs[Y]) => Partial<Record<`-${string}`, string>>;
} = {
  color: none,
  dimension: none,
  duration: none,
  fontFamily: none,
  fontWeight: none,
  number: none,
  cubicBezier: none,
  strokeStyle: none,
  border: none,
  transition: none,
  shadow: none,
  gradient: none,
  typography: (value) => {
    return { "-letter-spacing": letterSpacing(value) };
  },
};

/**
 * Serializes the bound value of a token to CSS text by its declared type. A
 * whole-value reference emits as `var()`. A reference in a composite value
 * emits as `var()` in place. The function assumes that the value matches the
 * shape of its declared type.
 */
export const serialize = <Y extends Type>(
  type: Y,
  value: Inputs[Y],
): string => {
  return serializers[type](value);
};

/**
 * Returns each declaration that the bound value of a token emits, keyed by the
 * suffix of the custom property name. The key `""` holds the serialization of
 * the value. The sibling declarations of the type follow under their suffixes.
 */
export const emit = <Y extends Type>(
  type: Y,
  value: Inputs[Y],
): Record<string, string> => {
  return { "": serializers[type](value), ...siblings[type](value) };
};
