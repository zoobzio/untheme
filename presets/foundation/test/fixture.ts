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

/**
 * Whether a srgb color literal carries a hex fallback that agrees with its
 * components: three channels, each scaled to 255 and rounded, matching the
 * hex byte pair.
 */
export const agrees = (value: unknown): boolean => {
  if (
    typeof value !== "object" ||
    value === null ||
    !("components" in value) ||
    !("hex" in value)
  ) {
    return false;
  }
  const { components, hex } = value;
  if (
    typeof hex !== "string" ||
    hex.length !== 7 ||
    !Array.isArray(components) ||
    components.length !== 3
  ) {
    return false;
  }
  return components.every((component, index) => {
    if (typeof component !== "number") {
      return false;
    }
    const byte = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
    return Math.round(component * 255) === byte;
  });
};
