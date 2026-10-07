import type { FontWeightKeyword } from "@untheme/schema";

/**
 * The numeric weight of each named `fontWeight` keyword. The serializer emits
 * named weights through this table.
 */
export const FONT_WEIGHT_NUMBERS = {
  thin: 100,
  "extra-light": 200,
  light: 300,
  normal: 400,
  medium: 500,
  "semi-bold": 600,
  bold: 700,
  "extra-bold": 800,
  black: 900,
} as const satisfies Record<FontWeightKeyword, number>;

/**
 * The names that are reserved words in a `font-family` slot. The set holds the
 * CSS-wide keywords and `default`. The serializer quotes a family with one of
 * these names.
 */
export const RESERVED_FAMILY_NAMES = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "default",
]);
