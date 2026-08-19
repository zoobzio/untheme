import type { AppUnthemeConfig, AppUnthemeInput } from "./types";

import { clone, copy } from "untheme";
import { useCookie, useState } from "#imports";
import { theme as buildTheme, input as buildInput } from "#build/untheme.mjs";

/**
 * The per-request state and cookies the plugin and composable share. The
 * build module's exports are process-wide singletons, so every seed is a
 * detached copy — never a reference SSR writes could reach across requests.
 */
export const accessUntheme = () => {
  const config = useState<AppUnthemeConfig>("untheme:config", () => ({
    theme: clone(buildTheme),
    input: copy(buildInput),
    override: {},
  }));

  const input = useCookie<AppUnthemeInput | null>("untheme-input");
  const key = useCookie<string | null>("untheme-key");

  return {
    config,
    cookies: { input, key },
  };
};
