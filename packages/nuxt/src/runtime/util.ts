import type {
  ReferenceToken,
  RoleToken,
  SystemToken,
} from "#build/types/untheme.d.ts";
import type { ThemeClient } from "./types";
import type { Untheme } from "untheme";

import { extend } from "#build/untheme.mjs";
import { useRequestFetch } from "#imports";
import { defineUntheme } from "untheme";
import { reactive } from "vue";
import { accessTheme } from "./store";
import { schema } from "./schema";

/**
 * Builds the {@link useUntheme} accessor. Lazily constructs a reactive
 * {@link Untheme} service from the shared store state on first use.
 */
export const makeUntheme = () => {
  let _service: Untheme<ReferenceToken, SystemToken, RoleToken>;
  return () => {
    if (_service) {
      return reactive(_service);
    }

    const { theme, mode } = accessTheme();
    _service = defineUntheme(theme.value, mode.value);

    return reactive(_service);
  };
};

/**
 * Builds the {@link useThemeClient} accessor. Returns a client whose `get(id)`
 * fetches `/themes/{id}.json`, validates the layer against the active token set,
 * and re-applies the configured `extend` overrides.
 */
export const makeThemeClient = () => {
  let _client: ThemeClient;
  return () => {
    if (_client) {
      return _client;
    }

    const fetch = useRequestFetch();

    _client = {
      async get(id) {
        const res = await fetch(`/themes/${id}.json`);
        const data = await res.json();
        const layer = schema.partial.parse(data);
        return schema.theme.parse({
          preset: layer.preset,
          key: layer.key,
          label: layer.label,
          reference: { ...layer.reference, ...(extend.reference ?? {}) },
          modes: {
            light: { ...layer.modes.light, ...(extend.modes?.light ?? {}) },
            dark: { ...layer.modes.dark, ...(extend.modes?.dark ?? {}) },
          },
          roles: extend.roles,
        });
      },
    };

    return _client;
  };
};
