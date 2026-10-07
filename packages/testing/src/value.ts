import type { Authored, Binding, Color } from "untheme";
import type { Terse, TerseBinding } from "./types";

import { InvalidSpecError } from "./error";

/** A hex color with 3 or 4 digits, 6 digits, or 8 digits with alpha. */
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** A dimension: a number and a unit that the schema accepts. */
const DIMENSION = /^(-?\d*\.?\d+)(px|rem)$/;

/** A duration: a number and a unit that the schema accepts. */
const DURATION = /^(-?\d*\.?\d+)(ms|s)$/;

/** A reference: a token name in braces. */
const REFERENCE = /^\{[^{}]+\}$/;

/** The forms that a terse string can take, for the error message. */
const FORMS =
  'a "#hex" color, a "px" / "rem" dimension, a "ms" / "s" duration, or a "{reference}"';

/**
 * Returns `true` when the value is a `{reference}` string.
 */
export const isReference = (value: unknown): value is `{${string}}` => {
  return typeof value === "string" && REFERENCE.test(value);
};

/**
 * Returns `true` when the value is a plain record, which is an object that is
 * not an array.
 */
const record = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

/** Converts one channel of a hex color to the unit interval, to four places. */
const channel = (pair: string): number => {
  return Math.round((Number.parseInt(pair, 16) / 255) * 10000) / 10000;
};

/**
 * Converts a hex string to the structured sRGB color that the schema accepts.
 * The components are in the unit interval. `alpha` is set when the hex has an
 * alpha channel that is not opaque. `hex` is the six-digit fallback.
 *
 * @param hex - A hex color with 3, 4, 6, or 8 digits.
 */
export const color = (hex: string): Color => {
  let digits = hex.slice(1).toLowerCase();
  if (digits.length <= 4) {
    digits = digits
      .split("")
      .map((digit) => digit + digit)
      .join("");
  }
  const pairs = digits.match(/.{2}/g) ?? [];
  const [r = "00", g = "00", b = "00", a] = pairs;
  const value: Color = {
    colorSpace: "srgb",
    components: [channel(r), channel(g), channel(b)],
    hex: `#${r}${g}${b}`,
  };
  if (a !== undefined && a !== "ff") {
    value.alpha = channel(a);
  }
  return value;
};

/**
 * Converts a terse string to a typed definition. A reference is returned as
 * is, because its type is the type of its target and the spec resolves it.
 *
 * @throws InvalidSpecError when the string is in no known form.
 */
const parse = (name: string, value: string): Authored | `{${string}}` => {
  if (isReference(value)) {
    return value;
  }
  if (HEX.test(value)) {
    return { $type: "color", $value: color(value) };
  }
  const dimension = DIMENSION.exec(value);
  if (dimension) {
    return {
      $type: "dimension",
      $value: {
        value: Number(dimension[1]),
        unit: dimension[2] as "px" | "rem",
      },
    };
  }
  const duration = DURATION.exec(value);
  if (duration) {
    return {
      $type: "duration",
      $value: { value: Number(duration[1]), unit: duration[2] as "ms" | "s" },
    };
  }
  throw new InvalidSpecError(
    `"${name}" is "${value}", which is not ${FORMS} — give it a full { $type, $value } definition`,
  );
};

/**
 * Converts a terse token value to a definition. A number is a `number`. A
 * string is parsed by its form. A full definition passes through. A reference
 * is returned as is, for the spec to type from its target.
 *
 * @param name - The name of the token, for the error message.
 * @param value - The terse value.
 * @throws InvalidSpecError when the value is in no known form.
 */
export const definition = (
  name: string,
  value: Terse,
): Authored | `{${string}}` => {
  if (typeof value === "number") {
    return { $type: "number", $value: value };
  }
  if (typeof value === "string") {
    return parse(name, value);
  }
  if (record(value) && typeof value.$type === "string") {
    return value;
  }
  throw new InvalidSpecError(
    `"${name}" is not a terse value or a { $type, $value } definition`,
  );
};

/**
 * Converts a terse override to the binding that a context holds. A reference
 * is returned as is. A terse string becomes its structured value. A number
 * and a structured value pass through.
 *
 * @param name - The name of the token, for the error message.
 * @param value - The terse override.
 * @throws InvalidSpecError when the value is in no known form.
 */
export const binding = (name: string, value: TerseBinding): Binding => {
  if (typeof value === "string") {
    const parsed = parse(name, value);
    return typeof parsed === "string" ? parsed : parsed.$value;
  }
  return value;
};
