import type { Mode } from "untheme";
import type { AppConfig, AppThemes } from "./types";

import { useCookie, useState } from "#imports";
import { theme as buildTheme, themes as buildThemes } from "#build/untheme.mjs";

export const accessUntheme = () => {
  const config = useState<AppConfig>("untheme:config", () => ({
    mode: "dark",
    theme: buildTheme,
  }));

  const themes = useState<AppThemes>("untheme:themes", () => buildThemes);

  const mode = useCookie<Mode>("untheme-mode");
  const key = useCookie<string | null>("untheme-key");

  return {
    config,
    themes,
    cookies: { mode, key },
  };
};
