import { defineUntheme } from "untheme";
import { useRoot } from "untheme/kit";
import { useState } from "#imports";
import { computed, reactive } from "vue";
// @ts-ignore
import config from "#build/untheme.config";
import type {
  RefToken,
  SysToken,
  ThemeToken,
  ModeToken,
  RoleToken,
} from "#build/types/untheme.d.ts";
import type { UnthemeConfig, UnthemeColorMode } from "untheme";

const untheme = defineUntheme(
  config as UnthemeConfig<RefToken, SysToken, ThemeToken, ModeToken, RoleToken>,
);
const themes = untheme.themes();

export type Theme = (typeof themes)[number];

export const useThemes = () => themes;
export const useTheme = () => useState<Theme>("theme", () => themes[0]);
export const useMode = () =>
  useState<UnthemeColorMode>("colormode", () => "dark");

export function useUntheme() {
  const theme = useTheme();
  const mode = useMode();
  const tokens = computed(() => reactive(untheme.use(theme.value, mode.value)));
  return {
    mode,
    theme,
    tokens,
    resolve: untheme.resolve,
  };
}

export function useUnthemeRoot() {
  const { tokens } = useUntheme();
  return computed(() => useRoot(tokens.value));
}
