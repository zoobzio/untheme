import type { AppUntheme, AppUnthemeContract, UnthemeNuxtApp } from "./types";

import { makeUntheme } from "untheme";
import { theme as buildTheme } from "#build/untheme/config.mjs";
import { accessUntheme } from "./store";

/**
 * Makes the untheme service over the shared state. The base theme is the
 * build module. The state holds the patch and the selection.
 * A write of the patch saves its id, or `null` when it has none, to the key
 * cookie and calls the `untheme:patch` hook. A write of the selection saves it to the input
 * cookie and calls the `untheme:input` hook. On the server, the function
 * restores the selection from the input cookie before the first render.
 */
export const makeNuxtUntheme = (nuxtApp: UnthemeNuxtApp): AppUntheme => {
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

  if (import.meta.server && cookies.input.value) {
    if (service.schema.check.input(cookies.input.value)) {
      config.value.input = cookies.input.value;
    } else {
      cookies.input.value = null;
    }
  }

  return service;
};
