import type { RadixLightRef, RadixDarkRef } from "./types";
import { RADIX_STEPS } from "./constant";

/** A raw Radix scale object, e.g. `{ blue1: "#fbfdff", ..., blue12: "#113264" }`. */
export type RadixScaleObject = Record<string, string>;

/**
 * Generates light and dark reference tokens for a named Radix scale.
 *
 * Radix ships each scale as two independently tuned palettes — a light object
 * (`blue`) and a dark object (`blueDark`) — that share step semantics but not
 * raw values. Both objects key their steps as `{name}{step}` (e.g. `blue9`),
 * so the same `name` reads both. Light steps are emitted as `{name}-{step}` and
 * dark steps as `{name}-dark-{step}`.
 *
 * @param name - Prefix for the token keys (e.g. "blue", "slate").
 * @param light - The light scale object from `@radix-ui/colors` (e.g. `blue`).
 * @param dark - The dark scale object from `@radix-ui/colors` (e.g. `blueDark`).
 * @returns A record of `{name}-{step}` and `{name}-dark-{step}` to hex values.
 */
export const createRadixColorTokens = <N extends string>(
  name: N,
  light: RadixScaleObject,
  dark: RadixScaleObject,
) => {
  type Tokens = Record<RadixLightRef<N> | RadixDarkRef<N>, string>;

  const tokens = {} as Tokens;

  for (const step of RADIX_STEPS) {
    tokens[`${name}-${step}`] = light[`${name}${step}`];
    tokens[`${name}-dark-${step}`] = dark[`${name}${step}`];
  }

  return tokens;
};
