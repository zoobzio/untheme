import type { ColorMode } from "untheme";

import { AppThemeOption, type AppTheme } from "./types";

import { useCookie, useState } from "#imports";
import {
  theme as buildTheme,
  options as buildOptions,
} from "#build/untheme.mjs";

/**
 * Provides shared reactive theme state backed by Nuxt's {@link useState} and {@link useCookie}.
 *
 * Intended for internal use by the untheme runtime — prefer {@link useTheme} in application code.
 */
export const accessTheme = () => {
  const initialized = useState<boolean>("untheme:initialized", () => false);

  const key = useState<string>("untheme:key", () => "system");
  const mode = useState<ColorMode>("untheme:mode", () => "dark");

  const theme = useState<AppTheme>("untheme:theme", () => buildTheme);
  const themes = useState<AppThemeOption[]>(
    "untheme:themes",
    () => buildOptions,
  );

  const cookies = {
    key: useCookie<string>("untheme-key"),
    mode: useCookie<ColorMode>("untheme-mode"),
  };

  return {
    initialized,
    key,
    mode,
    theme,
    themes,
    cookies,
  };
};
