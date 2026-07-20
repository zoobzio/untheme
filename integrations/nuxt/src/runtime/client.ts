import type { Token, Mod } from "#build/types/untheme.d.ts";
import type { AppUntheme, UnthemeNuxtApp } from "./types";

import { defineUntheme } from "untheme";
import { accessUntheme } from "./store";

export const makeUntheme = (nuxtApp: UnthemeNuxtApp): AppUntheme => {
  const { config, cookies } = accessUntheme();

  const service = defineUntheme<Token, Mod>(config.value, {
    set: {
      config: {
        theme: (theme) => {
          cookies.key.value = theme.id;
          nuxtApp.callHook("untheme:theme", theme);
          return theme;
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

  /**
   * TODO implement cookies 
  if (import.meta.server && cookies.key.value) {
    const layer = themes.value[cookies.key.value];
    if (service.schema.check.layer(layer)) {
      service.apply(layer);
    } else {
      cookies.key.value = null;
    }
  }
  */

  return service;
};
