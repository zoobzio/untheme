import type { Theme } from "#build/types/untheme.d.ts";
import type { AppTheme } from "./types";

import { themes } from "#build/untheme.mjs";
import { useRequestFetch } from "#imports";
import { readonly, computed } from "vue";
import { accessTheme } from "./store";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Composable for managing the active theme, color mode, and available themes.
 *
 * Exposes readonly reactive state for the current theme key, resolved theme data,
 * and color mode, along with methods to initialize from cookies, toggle the color
 * mode, and switch themes.
 */
export const useTheme = () => {
  const { key, theme, mode, cookies } = accessTheme();

  const tokens = computed(() => ({
    ...theme.value.reference,
    ...theme.value.modes[mode.value],
    ...theme.value.roles,
  }));

  const fetch = useRequestFetch();
  const load = () => fetch<AppTheme>(`/api/theme/${key.value}`);

  /** Syncs theme state from cookies, fetching the theme data if the key has changed. */
  const initialize = async () => {
    if (cookies.mode.value && cookies.mode.value !== mode.value) {
      mode.value = cookies.mode.value;
    }

    if (cookies.key.value && cookies.key.value !== key.value) {
      key.value = cookies.key.value;
      theme.value = await load();
    }

    return true;
  };

  const toggle = () => {
    cookies.mode.value = mode.value = mode.value === "dark" ? "light" : "dark";
  };

  const set = (value: Theme) => {
    cookies.key.value = key.value = value;
  };

  /** Updates the active theme w/ a partial token override */
  const update = ({ reference, modes, roles }: DeepPartial<AppTheme>) => {
    theme.value = {
      label: theme.value.label,
      reference: {
        ...theme.value.reference,
        ...reference,
      },
      modes: {
        light: {
          ...theme.value.modes.light,
          ...modes?.light,
        },
        dark: {
          ...theme.value.modes.dark,
          ...modes?.dark,
        },
      },
      roles: {
        ...theme.value.roles,
        ...roles,
      },
    };
  };

  return {
    key: readonly(key),
    theme: readonly(theme),
    mode: readonly(mode),
    themes,
    tokens,
    initialize,
    toggle,
    set,
    update,
  };
};
