import type { AppUnthemeContract, AppUntheme } from "./types";
import type { Catalog } from "untheme/catalog";
import type { Renderer } from "untheme/css";

import { useNuxtApp } from "#app";

import { makeCatalog } from "./catalog";

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
 * service. `root()` and `variables()` render again when the patch or the
 * selection changes. Use the renderer to get the custom property of a token
 * with `property` or `var`, to read the live value of a token, or to emit a
 * static set with `root(set)` or `variables(set)`.
 */
export const useUnthemeRenderer = (): Renderer<AppUnthemeContract> => {
  const { $unthemeRenderer } = useNuxtApp();
  return $unthemeRenderer;
};

/**
 * Returns a catalog over the layers of the build. `list` pages the entries of
 * the layers module. `get` imports one layer on demand and checks it against
 * the contract of the app. The catalog is empty when the build has no layers.
 *
 * ```ts
 * const catalog = useUnthemeCatalog();
 * const layer = await catalog.get("nord");
 * if (layer) useUntheme().apply(layer);
 * ```
 */
export const useUnthemeCatalog = (): Catalog<AppUnthemeContract> => {
  return makeCatalog(useUntheme().schema);
};
