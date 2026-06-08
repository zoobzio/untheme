import { toRefs } from "vue";
import { accessTheme } from "./store";
import { makeThemeClient, makeUntheme } from "./util";

/** Accessor for the shared reactive {@link Untheme} service. */
export const useUntheme = makeUntheme();

/** Accessor for the theme client used to fetch theme layers on demand. */
export const useThemeClient = makeThemeClient();

/**
 * Composable for managing the active theme, color mode, and available themes.
 *
 * Exposes reactive `mode`, `theme`, `tokens`, and the list of available `themes`,
 * plus an async `init` that syncs color mode and theme from cookies on hydration.
 */
export const useTheme = () => {
  const { initialized, key, themes, cookies } = accessTheme();

  const client = useThemeClient();
  const untheme = useUntheme();
  const { mode, theme, tokens } = toRefs(untheme);

  const init = async () => {
    if (initialized.value) {
      return;
    }

    if (cookies.mode.value && cookies.mode.value !== mode.value) {
      mode.value = cookies.mode.value;
    }

    const cookieKey = cookies.key.value;
    if (cookieKey && cookieKey !== key.value) {
      theme.value = await client.get(cookieKey);
      key.value = cookieKey;
    }

    initialized.value = true;
    return initialized.value;
  };

  return {
    mode,
    theme,
    themes,
    tokens,
    init,
  };
};
