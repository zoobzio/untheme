import { defineUntheme } from "untheme";
import type { UnthemeColorMode } from "untheme";
// @ts-expect-error
import config from "#build/untheme.config.mjs";
import type { UnthemeConfig } from "#build/types/untheme.d.ts";

const untheme = defineUntheme(config as UnthemeConfig);
const themes = untheme.themes();

export type Theme = (typeof themes)[number];

export function useThemes() {
  return themes;
}

export function useUntheme(
  initTheme: Theme = themes[0],
  initMode: UnthemeColorMode = "dark"
) {
  const theme = useState<Theme>("theme", () => initTheme);
  const mode = useState<UnthemeColorMode>("mode", () => initMode);
  const tokens = computed(() => reactive(untheme.use(theme.value, mode.value)));
  return {
    mode,
    theme,
    tokens,
  };
}
