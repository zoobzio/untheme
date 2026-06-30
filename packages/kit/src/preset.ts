import type { Config } from "@untheme/core";
import type { Contract, Input, Layer, Theme, Value } from "@untheme/schema";
import type { Extension } from "@untheme/utils";
import type { Preset } from "./types";

import { clone, extend, merge } from "@untheme/utils";

/**
 * Creates the authoring handle for a preset from its base theme.
 *
 * `define` resolves a variant layer against the base into a complete theme:
 * the layer's identity, its bindings over the base's. `configure` derives a
 * new preset whose base is this one widened by the given extension — overriding
 * base tokens and contexts and admitting new ones beyond the base's contract.
 * `use` produces a ready {@link Config} for `defineUntheme` from the base.
 *
 * @param base - The complete theme the preset ships as its default.
 * @returns The preset's `define`/`configure`/`use` authoring handle.
 */
export const defineUnthemePreset = <
  Tok extends string,
  Mod extends Record<
    string,
    Record<string, Partial<Record<NoInfer<Tok>, `{${Tok}}` | Value>>>
  >,
>(
  base: Contract<Tok, Mod>,
): Preset<Contract<Tok, Mod>> => {
  type T = Contract<Tok, Mod>;

  /**
   * Resolves a variant against the base: its identity, its overrides merged
   * over the base tokens and modifier contexts.
   */
  const define = (layer: Layer<T>): Theme<T> => {
    return merge(base, layer);
  };

  /**
   * Derives a new preset over the widened contract: base tokens and contexts
   * overridden where the extension binds them, new tokens and modifiers joining
   * the contract, identity from the extension. The X generics carry the
   * extension's own token and modifier sets.
   */
  const configure = <
    XTok extends string,
    XMod extends Record<
      string,
      Record<string, Partial<Record<string, string>>>
    >,
  >(
    extension: Extension<Tok, Mod, XTok, XMod>,
  ): Preset<Contract<Tok | XTok, Mod & XMod>> => {
    return defineUnthemePreset(extend(base, extension));
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
