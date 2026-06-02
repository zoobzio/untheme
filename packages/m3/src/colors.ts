import type { M3Tone } from "./types";
import {
  argbFromHex,
  Hct,
  TonalPalette,
} from "@material/material-color-utilities";
import { M3_TONES } from "./constant";

/**
 * Generates a named M3 tonal palette from a hex color.
 *
 * Produces tone values at each of the 26 M3 tone stops (0–100),
 * keyed as `{name}-{tone}`.
 *
 * @param name - Prefix for the token keys (e.g. "violet", "red").
 * @param hex - Base hex color (e.g. "#6750A4").
 * @returns A record of `{name}-{tone}` to hex color values.
 */
export const createM3ColorTokens = <N extends string>(name: N, hex: string) => {
  type Palette = Record<`${N}-${M3Tone}`, string>;

  const hct = Hct.fromInt(argbFromHex(hex));
  const palette = TonalPalette.fromHueAndChroma(hct.hue, hct.chroma);

  return M3_TONES.reduce<Palette>((tokens, tone) => {
    const argb = palette.tone(tone);

    const r = (argb >> 16) & 0xff;
    const g = (argb >> 8) & 0xff;
    const b = argb & 0xff;

    tokens[`${name}-${tone}`] =
      "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

    return tokens;
  }, {} as Palette);
};
