/**
 * The 10 standard shade stops used in M2 palettes.
 */
export const M2_SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;

/**
 * The 4 accent shade stops used in M2 palettes.
 */
export const M2_ACCENT_SHADES = ["A100", "A200", "A400", "A700"] as const;

/**
 * All 14 M2 palette stops (standard + accent).
 */
export const M2_STOPS = [...M2_SHADES, ...M2_ACCENT_SHADES] as const;

/**
 * Maps M2 standard shade numbers to HCT tone values.
 *
 * Lighter shades map to higher tones, darker shades to lower tones.
 */
export const M2_SHADE_TONE_MAP: Record<(typeof M2_SHADES)[number], number> = {
  50: 95,
  100: 90,
  200: 80,
  300: 70,
  400: 62,
  500: 50,
  600: 42,
  700: 35,
  800: 25,
  900: 15,
};

/**
 * Maps M2 accent shade labels to HCT tone values.
 *
 * Accent shades use the same tonal range but with boosted chroma.
 */
export const M2_ACCENT_TONE_MAP: Record<
  (typeof M2_ACCENT_SHADES)[number],
  number
> = {
  A100: 88,
  A200: 68,
  A400: 52,
  A700: 35,
};
