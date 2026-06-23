import type {
  Contract,
  Layer,
  Template,
  Reference,
  System,
  Role,
  Mode,
  Theme,
} from "@untheme/schema";
import type { Config } from "@untheme/core";

/**
 * The authoring handle for a preset, returned by `defineUnthemePreset`.
 */
export interface Preset<T extends Template> {
  /**
   * Resolves a variant layer against the base into a complete theme: its
   * identity, its overrides merged over the base tokens.
   */
  define: (theme: Layer<T>) => Theme<T>;

  /**
   * Derives a new preset whose base is this one widened by the theme: base
   * tokens overridden where the theme binds them, new tokens joining the
   * contract, identity from the theme.
   */
  configure: <Ref extends string, Sys extends string, Rol extends string>(
    theme: Contract<Ref | Reference<T>, Sys | System<T>, Rol | Role<T>>,
  ) => Preset<Contract<Ref | Reference<T>, Sys | System<T>, Rol | Role<T>>>;

  /**
   * Builds a ready service config for `defineUntheme`: the given mode and a
   * detached copy of the preset's base theme.
   */
  use: (mode: Mode) => Config<T>;
}
