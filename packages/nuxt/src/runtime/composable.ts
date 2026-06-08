import { toRefs } from "vue";
import { accessTheme } from "./store";
import { makeThemeClient, makeUntheme } from "./util";

export const useUntheme = makeUntheme();

export const useThemeClient = makeThemeClient();

/**
 * Composable for managing the active theme, color mode, and available themes.
 *
 * Exposes readonly reactive state for the current theme key, resolved theme data,
 * and color mode, along with methods to initialize from cookies and toggle the color mode.
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
