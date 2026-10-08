import type { AppUnthemeConfig, AppUnthemeInput } from "./types";

import { copy } from "objectively";
import { useCookie, useState } from "#imports";
import { input as buildInput } from "#build/untheme/config.mjs";

/**
 * Returns the state and the cookies that the plugin and the composable share.
 * The state holds the patch and the selection. It starts with an empty patch
 * and a copy of the selection of the build module.
 */
export const accessUntheme = () => {
  const config = useState<AppUnthemeConfig>("untheme:config", () => ({
    patch: {},
    input: copy(buildInput),
  }));

  const input = useCookie<AppUnthemeInput | null>("untheme-input");
  const key = useCookie<string | null>("untheme-key");

  return {
    config,
    cookies: { input, key },
  };
};
