/**
 * The tonal ramp vocabulary: eight functional palettes, each at the eleven
 * Tailwind-style stops — the token names scripts/generate.mjs emits and
 * every theme layer rebinds. Accent ramps carry the balanced column plus
 * muted and vivid chroma columns; the neutral ramps are single-column.
 */
const ACCENT_RAMPS = [
  "primary",
  "secondary",
  "tertiary",
  "error",
  "success",
  "warning",
];

const NEUTRAL_RAMPS = ["neutral", "neutral-variant"];

const COLUMNS = ["", "-muted", "-vivid"];

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const RAMP_TOKENS = [
  ...ACCENT_RAMPS.flatMap((ramp) => {
    return COLUMNS.flatMap((column) => {
      return STOPS.map((stop) => `${ramp}${column}-${stop}`);
    });
  }),
  ...NEUTRAL_RAMPS.flatMap((ramp) => {
    return STOPS.map((stop) => `${ramp}-${stop}`);
  }),
];

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
