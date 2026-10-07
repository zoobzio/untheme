import type { AppUnthemeContract, AppUntheme } from "./types";
import type { Renderer } from "untheme/css";

import { useNuxtApp } from "#app";

/**
 * Returns the `$untheme` service for the active theme, the selection, and the
 * catalog. Each read and write goes through the reactive `config` container.
 * The actions that change the theme or the selection save the selection to
 * cookies and call a Nuxt hook. The cookies hold the active `input` and the
 * theme `key`.
 */
export const useUntheme = (): AppUntheme => {
  const { $untheme } = useNuxtApp();
  return $untheme;
};

/**
 * Returns the CSS renderer for the contract of the app. The plugin provides
 * the renderer as `$unthemeRenderer`. The renderer reads the same `$untheme`
 * service. `root()` and `variables()` render again when the active selection,
 * theme, or override changes. Use the renderer to get the custom property of
 * a token with `property` or `var`, to read the live value of a token, or to
 * emit a static set with `root(set)` or `variables(set)`.
 */
export const useUnthemeRenderer = (): Renderer<AppUnthemeContract> => {
  const { $unthemeRenderer } = useNuxtApp();
  return $unthemeRenderer;
};
