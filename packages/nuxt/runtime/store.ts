import { useCookie, useState } from "#imports";

import { key as buildKey, theme as buildTheme } from "#build/untheme.mjs";

import type { AppTheme } from "./types";
import type { ThemeMode } from "untheme";
import type { Theme } from "#build/types/untheme.d.ts";

/**
 * Provides shared reactive theme state backed by Nuxt's {@link useState} and {@link useCookie}.
 *
 * Intended for internal use by the untheme runtime — prefer {@link useTheme} in application code.
 */
export const accessTheme = () => {
  const key = useState<Theme>("untheme:key", () => buildKey);
  const theme = useState<AppTheme>("untheme:theme", () => buildTheme);
  const mode = useState<ThemeMode>("untheme:mode", () => "dark");

  const cookies = {
    key: useCookie<Theme>("untheme-key"),
    mode: useCookie<ThemeMode>("untheme-mode"),
  };

  return {
    key,
    theme,
    mode,
    cookies,
  };
};
