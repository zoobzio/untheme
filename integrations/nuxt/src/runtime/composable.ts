import type { AppUnthemeContract, AppUntheme } from "./types";
import type { Catalog } from "untheme/catalog";
import type { Renderer } from "untheme/css";

import { useNuxtApp } from "#app";
import { useRequestFetch, useRuntimeConfig } from "#imports";
import { defineClient } from "untheme/catalog";

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
 * Returns a catalog client over the catalog that the module serves. The client
 * checks each layer against the contract of the app. Requests go through the
 * fetch of the request, so a call during server rendering reaches the same
 * app.
 *
 * ```ts
 * const catalog = useUnthemeCatalog();
 * const layer = await catalog.get("nord");
 * if (layer) useUntheme().apply(layer);
 * ```
 *
 * @throws When the module serves no catalog: the build has no layers, or
 * `route` is `false`.
 */
export const useUnthemeCatalog = (): Catalog<AppUnthemeContract> => {
  const { untheme } = useRuntimeConfig().public as {
    untheme?: { route?: string };
  };
  const route = untheme?.route;
  if (typeof route !== "string") {
    throw new Error(
      "untheme: no theme catalog is served — the build has no layers, or `route` is false",
    );
  }
  const request = useRequestFetch();
  return defineClient(useUntheme().schema, {
    base: route,
    fetch: (url, init) =>
      request.raw(String(url), {
        headers: init?.headers,
        ignoreResponseError: true,
      }),
  });
};
