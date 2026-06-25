import type {
  ReferenceToken,
  SystemToken,
  RoleToken,
} from "#build/types/untheme.d.ts";
import type { AppUntheme, UnthemeNuxtApp } from "./types";

import { defineUntheme } from "untheme";
import { accessUntheme } from "./store";

export const makeUntheme = (nuxtApp: UnthemeNuxtApp): AppUntheme => {
  const { config, themes, cookies } = accessUntheme();

  const service = defineUntheme<ReferenceToken, SystemToken, RoleToken>(
    config.value,
    themes.value,
    {
      set: {
        config: {
          mode: (mode) => {
            cookies.mode.value = mode;
            nuxtApp.callHook("untheme:mode", mode);
            return mode;
          },
          theme: (theme) => {
            cookies.key.value = theme.id;
            nuxtApp.callHook("untheme:theme", theme);
            return theme;
          },
        },
      },
    },
  );

  if (import.meta.server && cookies.mode.value) {
    config.value.mode = cookies.mode.value;
  }

  if (import.meta.server && cookies.key.value) {
    const layer = themes.value[cookies.key.value];
    if (service.schema.guard.layer(layer)) {
      service.apply(layer);
    } else {
      cookies.key.value = null;
    }
  }

  return service;
};
