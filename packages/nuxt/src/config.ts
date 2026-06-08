import type { NuxtUnthemeConfigFactory } from "./types";

/**
 * Identity helper that types an untheme module config and infers the preset,
 * theme, and token unions from the chosen preset.
 *
 * @param config - The untheme module configuration.
 * @returns The same config, narrowed to its inferred types.
 */
export const defineUnthemeConfig: NuxtUnthemeConfigFactory = (config) => config;
