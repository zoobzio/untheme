import type { Input, Template } from "@untheme/schema";
import type { Config } from "@untheme/core";
import { clone, copy } from "@untheme/utils";

/**
 * An application's untheme configuration: the base theme carrying the
 * contract and its default bindings, and the selection to boot with — one
 * context per modifier. The canonical shape every integration consumes,
 * conventionally authored in an `untheme.config.ts`.
 */
export interface UnthemeConfig<T extends Template> {
  /**
   * The complete base theme: every token with its `$type` and `$value`, and
   * each modifier's contexts.
   */
  theme: T;

  /**
   * The selection to boot with: one context per modifier.
   */
  input: Input<T>;
}

/**
 * Identity helper that types an untheme configuration and infers the token
 * and modifier unions from `theme`.
 *
 * @param config - The untheme configuration.
 * @returns The same config, narrowed to its inferred types.
 */
export const defineUnthemeConfig = <T extends Template>(
  config: UnthemeConfig<T>,
) => config;

/**
 * Seeds a fresh runtime state container from an authored configuration: a
 * detached clone of the theme as the active theme, a detached copy of the
 * boot selection, and an empty override. Nothing is held by reference, so
 * every call yields an independent container — containers seeded for
 * concurrent sessions (SSR requests, previews) cannot reach each other's
 * state through the shared config.
 *
 * @param config - The untheme configuration.
 * @returns A fresh {@link Config} container, ready for `defineUntheme`.
 */
export const useUnthemeConfig = <T extends Template>(
  config: UnthemeConfig<T>,
): Config<T> => {
  return {
    theme: clone(config.theme),
    input: copy(config.input),
    override: {},
  };
};
