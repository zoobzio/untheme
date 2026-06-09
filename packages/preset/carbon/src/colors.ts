import type { CarbonGrade, CarbonRef } from "./types";
import { CARBON_GRADES } from "./constant";

/** A raw Carbon scale object from `@carbon/colors`, e.g. `{ 10: "#edf5ff", …, 100: "#001141" }`. */
export type CarbonScaleObject = Record<CarbonGrade, string>;

/**
 * Generates reference tokens for a named Carbon color family.
 *
 * Carbon ships each family as a single grade-keyed object (`{ 10, 20, …, 100 }`)
 * that is mode-independent — the same hex serves both light and dark themes, so
 * only one set of `{name}-{grade}` references is emitted per family. Light/dark
 * divergence happens in the system tokens, which alias different grades per mode.
 *
 * @param name - Prefix for the token keys (e.g. "blue", "cool-gray").
 * @param scale - The family object from `@carbon/colors` (e.g. `blue`, `coolGray`).
 * @returns A record of `{name}-{grade}` to hex values.
 */
export const createCarbonColorTokens = <N extends string>(
  name: N,
  scale: CarbonScaleObject,
) => {
  type Tokens = Record<CarbonRef<N>, string>;

  const tokens = {} as Tokens;

  for (const grade of CARBON_GRADES) {
    tokens[`${name}-${grade}`] = scale[grade];
  }

  return tokens;
};
