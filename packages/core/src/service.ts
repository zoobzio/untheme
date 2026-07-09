import type { Contract, Layer, SharedBinding } from "@untheme/schema";
import type { Config, Options, Untheme } from "./types";

import { makeUntheme } from "./factory";

/**
 * Creates a runtime {@link Untheme} service from an authored contract — the
 * front door for defining a theme inline. `Tok` is inferred from the token
 * keys and every value position draws its suggestions from the signature:
 * token slots are discriminated by their declared `$type`, and modifier
 * overrides suggest the contract's tokens and references. Booting from a
 * machine-built theme instead — a `configure`-widened preset, a merged theme —
 * goes through {@link makeUntheme}, whose slots carry runtime-validated
 * bindings.
 *
 * @param config - The caller-owned container: active theme, selection, override.
 * @param themes - The catalog of switchable layers, validated up front; the
 *   target of `select`, `create`, and `remove`.
 * @param options - Read/write middleware over `config` and `themes`.
 * @returns An {@link Untheme} service bound to the container.
 * @throws InvalidThemeError when the theme or selection violates the contract.
 * @throws InvalidLayerError when a registry layer steps outside the contract.
 */
export const defineUntheme = <
  Tok extends string,
  Mod extends Record<
    string,
    Record<string, Partial<Record<NoInfer<Tok>, SharedBinding<Tok>>>>
  >,
>(
  config: Config<Contract<Tok, Mod>>,
  themes: Record<string, Layer<Contract<Tok, Mod>>> = {},
  options: Options<Contract<Tok, Mod>> = {},
): Untheme<Contract<Tok, Mod>> => {
  return makeUntheme<Contract<Tok, Mod>>(config, themes, options);
};
