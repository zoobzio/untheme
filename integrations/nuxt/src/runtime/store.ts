import type { AppUnthemeConfig, AppUnthemeInput } from "./types";

import { copy } from "objectively";
import { useCookie, useState } from "#imports";
import {
  theme as buildTheme,
  input as buildInput,
} from "#build/untheme/config.mjs";

/**
 * The base theme of the app, as the build module exports it. The service
 * takes it as its base. The state does not hold it.
 */
export { buildTheme };

/**
 * Returns the state and the cookies that the plugin and the composable share.
 * The state holds what changed from the base theme: the applied layer, the
 * selection, and the user override. It starts with a copy of the selection of
 * the build module, an empty override, and no layer. Each request has its own
 * state.
 */
export const accessUntheme = () => {
  const config = useState<AppUnthemeConfig>("untheme:config", () => ({
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
