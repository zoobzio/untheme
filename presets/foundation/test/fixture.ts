/**
 * The tonal ramp vocabulary: eight functional palettes, each at the 26 M3
 * tone stops — the token names scripts/generate.mjs emits and every theme
 * layer rebinds.
 */
const RAMPS = [
  "primary",
  "secondary",
  "tertiary",
  "error",
  "success",
  "warning",
  "neutral",
  "neutral-variant",
];

const TONES = [
  0, 4, 6, 10, 12, 17, 20, 22, 24, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90, 92,
  94, 95, 96, 98, 99, 100,
];

export const RAMP_TOKENS = RAMPS.flatMap((ramp) => {
  return TONES.map((tone) => `${ramp}-${tone}`);
});
