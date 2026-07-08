import type { FontWeightKeyword } from "@untheme/schema";

/**
 * The numeric weight each named `fontWeight` keyword stands for. CSS
 * `font-weight` accepts no keyword beyond `normal` and `bold`, so named
 * weights are emitted through this table.
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
