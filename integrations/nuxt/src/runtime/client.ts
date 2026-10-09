import type { AppUntheme, AppUnthemeContract, UnthemeNuxtApp } from "./types";

import { makeUntheme } from "untheme";
import { theme as buildTheme } from "#build/untheme/config.mjs";
import { layers } from "#build/untheme/layers.mjs";
import { copy } from "objectively";

import { makeCatalog } from "./catalog";
import { accessUntheme } from "./store";

/**
 * Makes the untheme service over the shared state. The base theme is the
 * build module. The state holds the patch and the selection. A write of the
 * patch saves its id, or `null` when it has none, to the key cookie and calls
 * the `untheme:patch` hook. A write of the selection saves it to the input
 * cookie and calls the `untheme:input` hook.
 *
 * `layers` lists the layers of the build. `select` loads one by id and applies
 * it. On the server, the function restores the selection from the input
 * cookie and the layer from the key cookie before the first render. A cookie
 * that fails the contract, or names no layer of the build, is cleared.
 */
export const makeNuxtUntheme = async (
  nuxtApp: UnthemeNuxtApp,
): Promise<AppUntheme> => {
  const { config, cookies } = accessUntheme();

  const service = makeUntheme<AppUnthemeContract>(buildTheme, config.value, {
    set: {
      config: {
        patch: (patch) => {
          cookies.key.value = patch.id ?? null;
          nuxtApp.callHook("untheme:patch", patch);
          return patch;
        },
        input: (input) => {
          cookies.input.value = input;
          nuxtApp.callHook("untheme:input", input);
          return input;
        },
      },
    },
  });

  const catalog = makeCatalog(service.schema);

  const select: AppUntheme["select"] = async (id) => {
    const layer = await catalog.get(id);
    if (layer !== undefined) {
      service.apply(layer);
    }
    return layer;
  };

  if (import.meta.server && cookies.input.value) {
    if (service.schema.check.input(cookies.input.value)) {
      config.value.input = cookies.input.value;
    } else {
      cookies.input.value = null;
    }
  }

  if (import.meta.server && cookies.key.value) {
    const layer = await catalog.get(cookies.key.value).catch(() => undefined);
    if (layer === undefined) {
      cookies.key.value = null;
    } else {
      config.value.patch = copy(layer);
    }
  }

  return Object.assign(service, { layers, select });
};
