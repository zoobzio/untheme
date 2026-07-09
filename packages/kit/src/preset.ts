import type { Contract, Binding } from "@untheme/schema";
import type { Preset } from "./types";

import { makePreset } from "./factory";

/**
 * Creates the authoring handle for a preset from its base theme.
 *
 * `define` resolves a variant layer against the base into a complete theme:
 * the layer's identity, its bindings over the base's. `configure` derives a
 * new preset whose base is this one widened by the given extension —
 * overriding base tokens and existing contexts and admitting new tokens and
 * axes beyond the base's contract — and the result configures again the same
 * way. `use` produces a ready {@link Config} for `defineUntheme` from the
 * base.
 *
 * @param base - The complete theme the preset ships as its default.
 * @returns The preset's `define`/`configure`/`use` authoring handle.
 */
export const defineUnthemePreset = <
  Tok extends string,
  Mod extends Record<
    string,
    Record<string, Partial<Record<NoInfer<Tok>, Binding>>>
  >,
>(
  base: Contract<Tok, Mod>,
): Preset<Tok, Mod, Contract<Tok, Mod>> => {
  return makePreset<Tok, Mod, Contract<Tok, Mod>>(base);
};
