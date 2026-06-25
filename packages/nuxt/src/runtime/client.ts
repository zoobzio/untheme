import type {
  ReferenceToken,
  SystemToken,
  RoleToken,
} from "#build/types/untheme.d.ts";
import type { Mode, Token, Tokens } from "untheme";
import type {
  AppUntheme,
  AppTheme,
  AppContract,
  UnthemeHookCaller,
} from "./types";

import { defineUntheme } from "untheme";
import { accessUntheme } from "./store";

export const makeUntheme = (nuxtApp: UnthemeHookCaller): AppUntheme => {
  const { config, themes, cookies } = accessUntheme();
  const service = defineUntheme<ReferenceToken, SystemToken, RoleToken>(
    config.value,
    themes.value,
  );

  if (import.meta.server && cookies.mode.value) {
    service.config.mode = cookies.mode.value;
  }

  if (import.meta.server && cookies.key.value) {
    const layer = themes.value[cookies.key.value];
    if (service.schema.guard.layer(layer)) {
      service.apply(layer);
    } else {
      cookies.key.value = null;
    }
  }

  return {
    config: {
      get mode() {
        return service.config.mode;
      },
      set mode(m: Mode) {
        service.config.mode = cookies.mode.value = m;
        nuxtApp.callHook("untheme:mode", m);
      },
      get theme() {
        return service.config.theme;
      },
      set theme(t: AppTheme) {
        service.config.theme = t;
        cookies.key.value = t.id;
      },
    },

    themes: service.themes,
    schema: service.schema,
    tokens: service.tokens,
    select: service.select,
    get: service.get,
    resolve: service.resolve,
    remove: service.remove,
    dirty: service.dirty,

    set: <K extends Token<AppContract>>(
      token: K,
      value: Tokens<AppContract>[K],
    ) => {
      service.set(token, value);
      nuxtApp.callHook("untheme:set", token, value);
    },

    update: (patch) => {
      service.update(patch);
      nuxtApp.callHook("untheme:update", patch);
    },

    apply: (layer) => {
      service.apply(layer);
      cookies.key.value = service.config.theme.id;
      nuxtApp.callHook("untheme:apply", service.config.theme);
    },

    create: (layer) => {
      const built = service.create(layer);
      nuxtApp.callHook("untheme:create", built);
      return built;
    },

    extract: (id, name) => {
      const built = service.extract(id, name);
      nuxtApp.callHook("untheme:extract", built);
      return built;
    },

    reset: () => {
      service.reset();
      nuxtApp.callHook("untheme:reset");
    },
  };
};
