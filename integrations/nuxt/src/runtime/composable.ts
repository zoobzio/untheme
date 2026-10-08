import type { AppUnthemeContract, AppUntheme } from "./types";
import type { Renderer } from "untheme/css";

import { useNuxtApp } from "#app";

/**
 * Returns the `$untheme` service. Each read and write goes through the
 * reactive `config` container. `swap` saves the selection to the input cookie.
 * `apply` and `update` save the id of the patch to the key cookie. Each one
 * calls a Nuxt hook.
 */
export const useUntheme = (): AppUntheme => {
  const { $untheme } = useNuxtApp();
  return $untheme;
};

/**
 * Returns the CSS renderer for the contract of the app. The plugin provides
 * the renderer as `$unthemeRenderer`. The renderer reads the same `$untheme`
 * service. `root()` and `variables()` render again when the patch, the
 * selection, or the override changes. Use the renderer to get the custom property of
 * a token with `property` or `var`, to read the live value of a token, or to
 * emit a static set with `root(set)` or `variables(set)`.
 */
export const useUnthemeRenderer = (): Renderer<AppUnthemeContract> => {
  const { $unthemeRenderer } = useNuxtApp();
  return $unthemeRenderer;
};
