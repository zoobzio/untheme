/**
 * The 10 grades in every Carbon color family, ordered from 10 (lightest) to
 * 100 (darkest). Carbon grades are mode-independent — a grade carries the same
 * raw value in every theme; only the semantic token → grade mapping changes.
 */
export const CARBON_GRADES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

/**
 * The Carbon color families, as token-key prefixes.
 *
 * Names are the kebab-case token form; the `@carbon/colors` exports they read
 * from are camelCase (e.g. `cool-gray` ← `coolGray`).
 */
export const CARBON_COLORS = [
  "blue",
  "cyan",
  "teal",
  "green",
  "gray",
  "cool-gray",
  "warm-gray",
  "red",
  "magenta",
  "purple",
  "orange",
  "yellow",
] as const;
