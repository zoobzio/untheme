import type { Config } from "@untheme/core";
import type { Contract, Input, Layer, Theme } from "@untheme/schema";
import type { Extension } from "@untheme/utils";
import type { CheckedModifiers, Grid, Preset } from "./types";

import { clone, extend, merge } from "@untheme/utils";

/**
 * Builds the authoring handle over a theme — the authored contract at the
 * root, an extended template after any widening. The `Theme<Contract<Tok,
 * ModK>>` bound is the recursion's currency: it carries the token union and
 * the modifier key grid without `Contract`'s conditional arm, so both an
 * authored contract and extend's output satisfy it at every level.
 */
export const makePreset = <
  Tok extends string,
  ModK extends Record<string, Record<string, object>>,
  T extends Theme<T> & Theme<Contract<Tok, ModK>>,
>(
  base: T,
): Preset<Tok, ModK, T> => {
  /**
   * Resolves a variant against the base: its identity, its overrides merged
   * over the base tokens and modifier contexts.
   */
  const define = (layer: Layer<T>): Theme<T> => {
    return merge<T>(base, layer);
  };

  /**
   * Widens the base by the extension and re-roots: the widened theme becomes
   * the next preset's base under the accumulated token union and key grid.
   * Type arguments are explicit throughout — `extend`'s own parameter cannot
   * infer `XMod`, so the precision inferred at this signature is forced into
   * its instantiation, and the recursion re-enters under the exact widened
   * parameters.
   */
  const configure = <
    XTok extends string,
    XMod extends Record<string, Record<string, object>> &
      CheckedModifiers<Tok | XTok, ModK, XMod>,
  >(
    extension: Extension<Tok, ModK, XTok, XMod> & { modifiers: XMod },
  ) => {
    const widened = extend<Tok, ModK, XTok, XMod>(base, extension);
    return makePreset<
      Tok | XTok,
      Grid<ModK, XMod>,
      ReturnType<typeof extend<Tok, ModK, XTok, XMod>>
    >(widened);
  };

  /**
   * Builds a ready service config: the given selection, a detached copy of the
   * base so service-side mutation never reaches the preset, and an empty
   * override.
   */
  const use = (input: Input<T>): Config<T> => {
    return {
      theme: clone(base),
      input,
      override: {},
    };
  };

  return {
    define,
    configure,
    use,
  };
};
