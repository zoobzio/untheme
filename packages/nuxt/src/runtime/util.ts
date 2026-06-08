import type {
  ReferenceToken,
  RoleToken,
  SystemToken,
} from "#build/types/untheme.d.ts";
import type { AppThemeLayer, ThemeClient } from "./types";
import type { Untheme } from "untheme";

import { extend, ref, sys } from "#build/untheme.mjs";
import { useRequestFetch } from "#imports";
import { defineUntheme } from "untheme";
import { reactive } from "vue";
import { accessTheme } from "./store";

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

    // TODO use a zod schema
    const check = (v: unknown): v is AppThemeLayer => {
      if (
        typeof v === "object" &&
        v !== null &&
        "reference" in v &&
        "modes" in v &&
        typeof v["reference"] == "object" &&
        v["reference"] !== null &&
        typeof v["modes"] === "object" &&
        v["modes"] !== null &&
        "dark" in v["modes"] &&
        typeof v["modes"]["dark"] === "object" &&
        v["modes"]["dark"] !== null
      ) {
        const layerRef = Object.keys(v.reference);
        const layerSys = Object.keys(v.modes.dark);
        return (
          layerRef.every((r) => ref.includes(r)) &&
          layerSys.every((s) => sys.includes(s))
        );
      }
      return false;
    };

    _client = {
      async get(id) {
        const res = await fetch(`/themes/${id}.json`);
        const data = await res.json();

        if (check(data)) {
          return {
            preset: data.preset,
            key: data.key,
            label: data.label,
            reference: { ...data.reference, ...(extend.reference ?? {}) },
            modes: {
              light: { ...data.modes.light, ...(extend.modes?.light ?? {}) },
              dark: { ...data.modes.dark, ...(extend.modes?.dark ?? {}) },
            },
            roles: extend.roles,
          };
        }

        throw new Error("Invalid theme data");
      },
    };

    return _client;
  };
};
