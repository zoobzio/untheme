import type { Config } from "@untheme/core";
import type { Contract, Layer, Mode, Theme } from "@untheme/schema";
import type { Preset } from "./types";

import { clone, extend, merge } from "@untheme/utils";

/**
 * Creates the authoring handle for a preset from its base theme.
 *
 * `define` resolves a variant layer against the base into a complete theme:
 * the layer's identity, its bindings over the base's. `configure` derives a
 * new preset whose base is this one widened by the given theme — overriding
 * base tokens and admitting new ones beyond the base's contract. `use`
 * produces a ready {@link Config} for `defineUntheme` from the base.
 *
 * @param base - The complete theme the preset ships as its default.
 * @returns The preset's `define`/`configure`/`use` authoring handle.
 */
export const defineUnthemePreset = <
  Ref extends string,
  Sys extends string,
  Rol extends string,
>(
  base: Contract<Ref, Sys, Rol>,
): Preset<Contract<Ref, Sys, Rol>> => {
  /**
   * Resolves a variant against the base: its identity, its overrides merged
   * over the base tokens.
   */
  const define = (
    layer: Layer<Contract<Ref, Sys, Rol>>,
  ): Theme<Contract<Ref, Sys, Rol>> => {
    return merge(base, layer);
  };

  /**
   * Derives a new preset over the widened contract: base tokens overridden
   * where the theme binds them, new tokens joining the contract, identity
   * from the theme. The X generics carry the theme's own token unions.
   */
  const configure = <
    XRef extends string,
    XSys extends string,
    XRol extends string,
  >(
    theme: Contract<Ref | XRef, Sys | XSys, Rol | XRol>,
  ): Preset<Contract<Ref | XRef, Sys | XSys, Rol | XRol>> => {
    return defineUnthemePreset(
      extend<Ref, Sys, Rol, XRef, XSys, XRol>(base, theme),
    );
  };

  /**
   * Builds a ready service config: the given mode and a detached copy of the
   * base, so service-side mutation never reaches the preset.
   */
  const use = (mode: Mode): Config<Contract<Ref, Sys, Rol>> => {
    return {
      mode,
      theme: clone(base),
    };
  };

  return {
    define,
    configure,
    use,
  };
};
