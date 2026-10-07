import type { AppUnthemeConfig, AppUnthemeInput } from "./types";

import { copy } from "objectively";
import { clone } from "untheme";
import { useCookie, useState } from "#imports";
import {
  theme as buildTheme,
  input as buildInput,
} from "#build/untheme/config.mjs";

/**
 * Returns the state and the cookies that the plugin and the composable share.
 * The state is a copy of the theme and the input of the build module. Each
 * request has its own state.
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
