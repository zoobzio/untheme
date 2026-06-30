import type {
  Contract,
  Input,
  Layer,
  Template,
  Theme,
  Token,
} from "@untheme/schema";
import type { Config } from "@untheme/core";
import type { Extension } from "@untheme/utils";

/**
 * The authoring handle for a preset, returned by `defineUnthemePreset`.
 */
export interface Preset<T extends Template> {
  /**
   * Resolves a variant layer against the base into a complete theme: its
   * identity, its overrides merged over the base tokens and modifier contexts.
   */
  define: (layer: Layer<T>) => Theme<T>;

  /**
   * Derives a new preset whose base is this one widened by the extension: base
   * tokens and contexts overridden where the extension binds them, new tokens
   * and modifiers joining the contract, identity from the extension.
   */
  configure: <
    XTok extends string,
    XMod extends Record<
      string,
      Record<string, Partial<Record<string, string>>>
    >,
  >(
    extension: Extension<Token<T>, T["modifiers"], XTok, XMod>,
  ) => Preset<Contract<Token<T> | XTok, T["modifiers"] & XMod>>;

  /**
   * Builds a ready service config for `defineUntheme`: the given selection, a
   * detached copy of the preset's base theme, and an empty override.
   */
  use: (input: Input<T>) => Config<T>;
}
