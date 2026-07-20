import type { Shadow, Open, Type } from "@untheme/schema";
import type { Inputs } from "./types";

import { isReference } from "@untheme/common";

import { FONT_WEIGHT_NUMBERS, RESERVED_FAMILY_NAMES } from "./constant";
import { indirection, property } from "./property";

/**
 * A single color channel: a finite number or the `none` sentinel.
 */
const channel = (value: number | "none"): string => {
  return String(value);
};

/**
 * A channel in a percentage slot: `hsl()` and `hwb()` take their second and
 * third components as percentages.
 */
const percentage = (value: number | "none"): string => {
  if (value === "none") {
    return "none";
  }
  return `${value}%`;
};

/**
 * A structured color: the hex fallback when present, else the color space's
 * own function — `hsl()`/`hwb()` with percentage components, the lab/lch
 * family by name, and everything else through `color()`.
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
 * A length or time span: the value with its unit appended. Serves both the
 * `dimension` and `duration` types, whose shapes are identical, and every
 * dimension slot nested in a composite value.
 */
const measure = (value: Inputs["dimension"] | Inputs["duration"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${value.value}${value.unit}`;
};

/**
 * A family name: bare when it is a plain ident and not a reserved word,
 * quoted otherwise — with quotes and backslashes escaped — so any name stays
 * one name.
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
 * A font family: a single name or an ordered fallback stack joined by commas.
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
 * A font weight: numbers pass through, named weights emit their numeric
 * equivalent, since CSS accepts no keyword beyond `normal` and `bold`.
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

/**
 * A plain number.
 */
const number = (value: Inputs["number"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return String(value);
};

/**
 * A cubic Bézier easing curve.
 */
const cubicBezier = (value: Inputs["cubicBezier"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `cubic-bezier(${value.join(", ")})`;
};

/**
 * A stroke style: the keywords are all valid `border-style` values and pass
 * through. The dash object has no CSS equivalent, so it falls back to
 * `dashed` — the nearest rendering CSS can express.
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
 * A border, as the `border` shorthand: width, style, color.
 */
const border = (value: Inputs["border"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${measure(value.width)} ${strokeStyle(value.style)} ${color(value.color)}`;
};

/**
 * A transition, as the `transition` shorthand: duration, timing function,
 * delay. The property slot is absent, so the declaration applies to `all`.
 */
const transition = (value: Inputs["transition"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${measure(value.duration)} ${cubicBezier(value.timingFunction)} ${measure(value.delay)}`;
};

/**
 * A single drop shadow: offsets, blur, spread, color.
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
 * A shadow: one layer, or a comma-joined stack of layers.
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
 * A gradient stop position: the unit interval scaled to a percentage. A
 * referenced position scales through `calc()` — the target is a number token
 * whose custom property holds a unitless value, which no position slot
 * accepts bare.
 */
const position = (value: number | `{${string}}`): string => {
  if (isReference(value)) {
    return `calc(${indirection(value)} * 100%)`;
  }
  return `${value * 100}%`;
};

/**
 * A gradient, as `linear-gradient()` over its stops in the default direction —
 * directly usable in an image slot.
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
 * A typography set, as the `font` shorthand: weight, size over line height,
 * family. Letter spacing cannot join the shorthand; it rides as the sibling
 * declaration the `siblings` table contributes.
 */
const typography = (value: Inputs["typography"]): string => {
  if (isReference(value)) {
    return indirection(value);
  }
  return `${fontWeight(value.fontWeight)} ${measure(value.fontSize)}/${number(value.lineHeight)} ${fontFamily(value.fontFamily)}`;
};

/**
 * The letter-spacing slot of a typography set, for the sibling declaration. A
 * whole-value reference points at the target's own sibling property, so the
 * indirection stays pair-wise.
 */
const letterSpacing = (value: Inputs["typography"]): string => {
  if (isReference(value)) {
    return `var(${property(value.slice(1, -1))}-letter-spacing)`;
  }
  return measure(value.letterSpacing);
};

/**
 * The serializer for each token type.
 */
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
 * A type that emits no sibling declarations.
 */
const none = () => {
  return {};
};

/**
 * The sibling declarations each token type contributes alongside its own
 * property, keyed by the suffix appended to the property name. Only
 * typography carries one: the `font` shorthand cannot hold letter spacing,
 * so it emits under `<name>-letter-spacing`.
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
 * Serializes a token's bound value to its CSS text by declared type. A
 * whole-value `{token}` reference emits as `var()`; references nested inside
 * composite values emit as `var()` in place. Input is trusted — a binding
 * that passed schema validation matches its declared type's shape.
 */
export const serialize = <Y extends Type>(
  type: Y,
  value: Inputs[Y],
): string => {
  return serializers[type](value);
};

/**
 * Every declaration a token's bound value emits, keyed by the suffix appended
 * to the token's custom property name: the value's own serialization under
 * `""`, and the type's sibling declarations under their dashed suffixes.
 */
export const emit = <Y extends Type>(
  type: Y,
  value: Inputs[Y],
): Record<string, string> => {
  return { "": serializers[type](value), ...siblings[type](value) };
};
