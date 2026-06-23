/**
 * The 12 steps in every Radix color scale, ordered from 1 (lightest backdrop)
 * to 12 (highest-contrast text).
 */
export const RADIX_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/**
 * The chromatic Radix scales (accent-capable colors).
 *
 * Names match the `@radix-ui/colors` export names verbatim.
 */
export const RADIX_COLORS = [
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "brown",
  "orange",
  "sky",
  "mint",
  "lime",
  "yellow",
  "amber",
  "gold",
  "bronze",
] as const;

/**
 * The neutral Radix scales, each tuned to pair with a family of accent colors.
 */
export const RADIX_GRAYS = [
  "gray",
  "mauve",
  "slate",
  "sage",
  "olive",
  "sand",
] as const;

/**
 * Every Radix scale name (chromatic + neutral).
 */
export const RADIX_SCALES = [...RADIX_COLORS, ...RADIX_GRAYS] as const;
