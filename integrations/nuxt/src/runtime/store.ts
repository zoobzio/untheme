import type { AppConfig, AppThemes, AppInput } from "./types";

import { clone, copy } from "untheme";
import { useCookie, useState } from "#imports";
import {
  theme as buildTheme,
  themes as buildThemes,
  input as buildInput,
} from "#build/untheme.mjs";

/**
 * The per-request state and cookies the plugin and composable share. The
 * build module's exports are process-wide singletons, so every seed is a
 * detached copy — never a reference SSR writes could reach across requests.
 */
export const accessUntheme = () => {
  const config = useState<AppConfig>("untheme:config", () => ({
    theme: clone(buildTheme),
    input: copy(buildInput),
    override: {},
  }));

  const themes = useState<AppThemes>("untheme:themes", () => copy(buildThemes));

  const input = useCookie<AppInput | null>("untheme-input");
  const key = useCookie<string | null>("untheme-key");

  return {
    config,
    themes,
    cookies: { input, key },
  };
};
