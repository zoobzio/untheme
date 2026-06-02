import type { UnthemeConfig } from "./types";

/**
 * Defines a typed Nuxt untheme configuration with inferred reference, system, and role tokens.
 *
 * @param config - The module configuration with theme definitions and a default theme key.
 * @returns The same configuration object with narrowed token types.
 */
export const defineUnthemeConfig = <
  Ref extends string,
  Sys extends string,
  Role extends string,
>(
  config: UnthemeConfig<Ref, Sys, Role>,
) => config;
