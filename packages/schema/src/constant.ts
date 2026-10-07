/**
 * Matches the sequences that can end a CSS declaration or fetch a resource.
 * The sequences are a semicolon, a brace, a backslash, a comment opener, a tag
 * closer, and `url()`.
 */
export const CSS_BREAKOUT = /[;{}\\]|\/\*|<\/|\burl\(/i;

/**
 * The DTCG token types that the schema recognizes. Every token declares one
 * type. The type sets the shape of the `$value` of the token. The `Type` union
 * and the runtime rules use this array.
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
 * The CSS Color Module color spaces that a `color` value can name. The
 * `ColorSpace` union and the runtime check on `colorSpace` use this array.
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
 * The units that a `dimension` value can use.
 */
export const DIMENSION_UNITS = ["px", "rem"] as const;

/**
 * The units that a `duration` value can use.
 */
export const DURATION_UNITS = ["ms", "s"] as const;

/**
 * The named weights that a `fontWeight` value can use in place of a number.
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
 * The keywords that a `strokeStyle` value can use in place of the dash object.
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
 * The line caps that a `strokeStyle` dash object can declare.
 */
export const LINE_CAPS = ["round", "butt", "square"] as const;

/**
 * The `"none"` keyword. The components array of a `color` accepts it in place
 * of a number, for a missing component.
 */
export const NONE = "none";

/**
 * The lowest and highest value of a numeric `fontWeight`.
 */
export const FONT_WEIGHT_MIN = 1;
export const FONT_WEIGHT_MAX = 1000;

/**
 * The reserved members of a token definition. A definition rejects any other key.
 */
export const DEFINITION_KEYS = [
  "$type",
  "$value",
  "$description",
  "$deprecated",
  "$extensions",
] as const;

/**
 * The members that every token definition must have. The other members in
 * {@link DEFINITION_KEYS} are optional.
 */
export const REQUIRED_DEFINITION_KEYS = ["$type", "$value"] as const;

/**
 * The members that a complete theme object must have.
 */
export const THEME_KEYS = [
  "id",
  "name",
  "tokens",
  "modifiers",
  "order",
] as const;
