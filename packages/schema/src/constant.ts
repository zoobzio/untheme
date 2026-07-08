/**
 * Sequences that let a value escape its CSS declaration (statements, blocks,
 * comments, tag closers, escapes) or fetch a resource (`url()`).
 */
export const CSS_BREAKOUT = /[;{}\\]|\/\*|<\/|\burl\(/i;

/**
 * The DTCG token types this schema recognizes. Every token declares one, and a
 * token's `$value` shape is fixed by it. This array is the single source of
 * truth: the `Type` union derives from it and the runtime rules iterate it.
 */
export const TYPES = [
  "color",
  "dimension",
  "duration",
  "fontFamily",
  "fontWeight",
  "number",
  "cubicBezier",
  "strokeStyle",
  "border",
  "transition",
  "shadow",
  "gradient",
  "typography",
] as const;

/**
 * The CSS Color Module color spaces a `color` value may name. Backs both the
 * `ColorSpace` union and the runtime membership check on `colorSpace`.
 */
export const COLOR_SPACES = [
  "srgb",
  "srgb-linear",
  "hsl",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "xyz-d65",
  "xyz-d50",
] as const;

/**
 * The units a `dimension` value may carry.
 */
export const DIMENSION_UNITS = ["px", "rem"] as const;

/**
 * The units a `duration` value may carry.
 */
export const DURATION_UNITS = ["ms", "s"] as const;

/**
 * The named weights a `fontWeight` value may use in place of a number.
 */
export const FONT_WEIGHTS = [
  "thin",
  "extra-light",
  "light",
  "normal",
  "medium",
  "semi-bold",
  "bold",
  "extra-bold",
  "black",
] as const;

/**
 * The keyword forms a `strokeStyle` value may take in place of the dash object.
 */
export const STROKE_STYLES = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "groove",
  "ridge",
  "outset",
  "inset",
] as const;

/**
 * The line caps a `strokeStyle` dash object may declare.
 */
export const LINE_CAPS = ["round", "butt", "square"] as const;

/**
 * The token entry to indicate a keyword can also be `"none"` — the missing
 * component sentinel a `color`'s components array accepts alongside numbers.
 */
export const NONE = "none";

/**
 * The lowest and highest a numeric `fontWeight` may be.
 */
export const FONT_WEIGHT_MIN = 1;
export const FONT_WEIGHT_MAX = 1000;

/**
 * The reserved members a token definition may carry. Any other key is rejected.
 */
export const DEFINITION_KEYS = [
  "$type",
  "$value",
  "$description",
  "$deprecated",
  "$extensions",
] as const;

/**
 * The members every token definition must carry; the rest of
 * {@link DEFINITION_KEYS} are optional.
 */
export const REQUIRED_DEFINITION_KEYS = ["$type", "$value"] as const;

/**
 * The members a complete theme object must carry.
 */
export const THEME_KEYS = [
  "id",
  "name",
  "tokens",
  "modifiers",
  "order",
] as const;
