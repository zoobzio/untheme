import type { Input, Layer, Binding, Theme } from "@untheme/schema";
import type { Config } from "@untheme/core";
import type { Extension } from "@untheme/utils";

import type { extend } from "@untheme/utils";

/**
 * A context override map in which every key must name a token of the contract
 * and every value must be a binding. The conditional defers inside generic
 * bodies, but as part of a constraint it is checked at each call site, where
 * the token union is concrete and the conditional evaluates.
 */
export type CheckedContext<Tok extends string, C> = {
  [K in keyof C]: K extends Tok ? Binding : never;
};

/**
 * The validator for an extension's modifiers literal: an existing axis may
 * only carry its existing contexts, a new axis may carry any, and every
 * context is a {@link CheckedContext}. Used as an F-bounded constraint on
 * `XMod`, so the inferred literal is validated wholesale at the call site.
 */
export type CheckedModifiers<Tok extends string, Mod, XMod> = {
  [M in keyof XMod]: M extends keyof Mod
    ? {
        [C in keyof XMod[M]]: C extends keyof Mod[M]
          ? CheckedContext<Tok, XMod[M][C]>
          : never;
      }
    : { [C in keyof XMod[M]]: CheckedContext<Tok, XMod[M][C]> };
};

/**
 * The axis and context key grid of a widened contract, values erased. A single
 * string-keyed mapped type, so it composes through repeated widenings and
 * stays reducible where an intersection would defer. Carried as a preset's
 * `ModK` so each level's extension is authored against the accumulated grid.
 */
export type Grid<ModK, XMod> = {
  [M in (keyof ModK | keyof XMod) & string]: {
    [C in keyof (ModK & XMod)[M] & string]: object;
  };
};

/**
 * The authoring handle for a preset. `Tok` is the token union, `ModK` the
 * modifier key grid, and `T` the theme the preset is bound to — the authored
 * contract at the root, an extended template after any `configure`.
 */
export interface Preset<
  Tok extends string,
  ModK extends Record<string, Record<string, object>>,
  T extends Theme<T>,
> {
  /**
   * Resolves a variant layer against the base into a complete theme: its
   * identity, its overrides merged over the base tokens and modifier contexts.
   */
  define: (layer: Layer<T>) => Theme<T>;

  /**
   * Derives a new preset whose base is this one widened by the extension: base
   * tokens and existing contexts overridden where the extension binds them,
   * new tokens and axes joining the contract, identity from the extension.
   *
   * The extension's known surface is checked — token keys everywhere, existing
   * axes locked to their contexts — while what it adds is inferred: `XTok`
   * from the tokens literal, `XMod` from the naked modifiers member. The
   * result is a preset over the widened template, itself configurable.
   */
  configure: <
    XTok extends string,
    XMod extends Record<string, Record<string, object>> &
      CheckedModifiers<Tok | XTok, ModK, XMod>,
  >(
    extension: Extension<Tok, ModK, XTok, XMod> & { modifiers: XMod },
  ) => Preset<
    Tok | XTok,
    Grid<ModK, XMod>,
    ReturnType<typeof extend<Tok, ModK, XTok, XMod>>
  >;

  /**
   * Builds a ready service config for `defineUntheme`: the given selection, a
   * detached copy of the preset's base theme, and an empty override.
   */
  use: (input: Input<T>) => Config<T>;
}
