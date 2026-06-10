import type { M2Shade } from "./types";
import {
  argbFromHex,
  Hct,
  TonalPalette,
} from "@material/material-color-utilities";
import {
  M2_SHADES,
  M2_ACCENT_SHADES,
  M2_SHADE_TONE_MAP,
  M2_ACCENT_TONE_MAP,
} from "./constant";

/** Chroma multiplier for accent shades — produces more vivid colors. */
const ACCENT_CHROMA_BOOST = 1.5;

/** Converts an ARGB integer to a 6-digit hex string. */
const argbToHex = (argb: number): string => {
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
};

/**
 * Generates a named M2 palette from a hex color.
 *
 * Produces 14 shade values: 10 standard shades (50–900) and 4 accent
 * shades (A100–A700) with boosted chroma, keyed as `{name}-{shade}`.
 *
 * @param name - Prefix for the token keys (e.g. "violet", "red").
 * @param hex - Base hex color (e.g. "#6200EE").
 * @returns A record of `{name}-{shade}` to hex color values.
 */
export const createM2ColorTokens = <N extends string>(name: N, hex: string) => {
  type Palette = Record<`${N}-${M2Shade}`, string>;

  const hct = Hct.fromInt(argbFromHex(hex));
  const basePalette = TonalPalette.fromHueAndChroma(hct.hue, hct.chroma);
  const accentPalette = TonalPalette.fromHueAndChroma(
    hct.hue,
    Math.min(hct.chroma * ACCENT_CHROMA_BOOST, 130),
  );

  const tokens = {} as Palette;

  for (const shade of M2_SHADES) {
    tokens[`${name}-${shade}`] = argbToHex(
      basePalette.tone(M2_SHADE_TONE_MAP[shade]),
    );
  }

  for (const shade of M2_ACCENT_SHADES) {
    tokens[`${name}-${shade}`] = argbToHex(
      accentPalette.tone(M2_ACCENT_TONE_MAP[shade]),
    );
  }

  return tokens;
};
