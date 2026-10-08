import type { AppUntheme, AppUnthemeContract, UnthemeNuxtApp } from "./types";

import { makeUntheme as makeService } from "untheme";
import { accessUntheme, buildTheme } from "./store";

/**
 * Makes the untheme service over the shared state. The base theme is the
 * build module. The state holds the layer, the selection, and the override.
 * A write of the layer saves its id to the key cookie and calls the
 * `untheme:layer` hook. A write of the selection saves it to the input
 * cookie and calls the `untheme:input` hook. On the server, the function
 * restores the selection from the input cookie before the first render.
 */
export const makeUntheme = (nuxtApp: UnthemeNuxtApp): AppUntheme => {
  const { config, cookies } = accessUntheme();

  const service = makeService<AppUnthemeContract>(buildTheme, config.value, {
    set: {
      config: {
        layer: (layer) => {
          cookies.key.value = layer.id;
          nuxtApp.callHook("untheme:layer", layer);
          return layer;
        },
        input: (input) => {
          cookies.input.value = input;
          nuxtApp.callHook("untheme:input", input);
          return input;
        },
      },
    },
  });

  if (import.meta.server && cookies.input.value) {
    if (service.schema.check.input(cookies.input.value)) {
      config.value.input = cookies.input.value;
    } else {
      cookies.input.value = null;
    }
  }

  return service;
};
