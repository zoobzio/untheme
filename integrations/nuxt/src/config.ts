import type { Template } from "untheme";
import type { NuxtUnthemeUserConfig } from "./types";

/**
 * Identity helper that types an untheme module config and infers the preset,
 * theme, and token unions from the chosen preset.
 *
 * @param config - The untheme module configuration.
 * @returns The same config, narrowed to its inferred types.
 */
export const defineUnthemeConfig = <T extends Template>(
  config: NuxtUnthemeUserConfig<T>,
) => config;
