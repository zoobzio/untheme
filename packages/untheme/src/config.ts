import type { Input, Template } from "@untheme/schema";
import type { Config } from "@untheme/core";
import { copy } from "objectively";

/**
 * The untheme configuration of an application. It has the base theme with the
 * contract and the default bindings, and the selection to start with. Each
 * integration reads this shape. `@untheme/kit` builds it from DTCG JSON and
 * writes it as the `config` module.
 */
export interface UnthemeConfig<T extends Template> {
  /**
   * The complete base theme. It has each token with its `$type` and `$value`,
   * and the contexts of each modifier.
   */
  theme: T;

  /**
   * The starting selection with one context for each modifier.
   */
  input: Input<T>;
}

/**
 * Types an untheme configuration. The function infers the token names and the
 * modifier names from `theme`.
 *
 * @param config - The untheme configuration.
 * @returns The same configuration, with the inferred types.
 */
export const defineUnthemeConfig = <T extends Template>(
  config: UnthemeConfig<T>,
) => config;

/**
 * Makes a state container from a configuration. The container has an empty
 * patch and a copy of the starting selection. Pass the theme of the
 * configuration as the base of the service:
 * `makeUntheme(config.theme, useUnthemeConfig(config))`. Each call makes a
 * new container.
 *
 * @param config - The untheme configuration.
 * @returns A {@link Config} container for `makeUntheme`.
 */
export const useUnthemeConfig = <T extends Template>(
  config: UnthemeConfig<T>,
): Config<T> => {
  return {
    patch: {},
    input: copy(config.input),
  };
};
