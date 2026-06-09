/**
 * The union of CSS value types a reference token may hold.
 *
 * Broad enough to accept any value the presets emit — colors, lengths, times,
 * numbers, multi-layer shadows, easing functions, and font-family lists — while
 * still rejecting structurally invalid CSS (e.g. `#ggg`, unbalanced functions,
 * empty strings).
 */
export const CSS_VALUE_SYNTAX =
  "<color> | <length> | <time> | <number> | <percentage> | <angle> | <shadow># | <easing-function> | [ <generic-family> | <family-name> ]#";
