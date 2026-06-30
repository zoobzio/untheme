import type { AppConfig, AppThemes, AppInput } from "./types";

import { useCookie, useState } from "#imports";
import {
  theme as buildTheme,
  themes as buildThemes,
  input as buildInput,
} from "#build/untheme.mjs";

export const accessUntheme = () => {
  const config = useState<AppConfig>("untheme:config", () => ({
    theme: buildTheme,
    input: buildInput,
    override: {},
  }));

  const themes = useState<AppThemes>("untheme:themes", () => buildThemes);

  const input = useCookie<AppInput | null>("untheme-input");
  const key = useCookie<string | null>("untheme-key");

  return {
    config,
    themes,
    cookies: { input, key },
  };
};
