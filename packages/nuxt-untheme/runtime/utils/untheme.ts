import { defineUntheme } from "untheme";
import { useRoot } from "untheme/kit";
import { useState } from "#imports";
import { computed, reactive } from "vue";
// @ts-ignore
import config from "#build/untheme.config";
import type {
  RefToken,
  SysToken,
  ModeToken,
  RoleToken,
} from "#build/types/untheme.d.ts";
import type {
  UnthemeConfig,
  UnthemeColorMode,
  UnthemeSysTokens,
} from "untheme";

const untheme = defineUntheme(
  config as UnthemeConfig<RefToken, SysToken, ModeToken, RoleToken>,
);

export const useTheme = () =>
  useState<UnthemeSysTokens<RefToken, SysToken>>("theme", () =>
    untheme.getTheme(),
  );
export const useMode = () =>
  useState<UnthemeColorMode>("colormode", () => "dark");

export function useUntheme() {
  const theme = useTheme();
  const mode = useMode();
  const tokens = computed(() => {
    untheme.setTheme(theme.value);
    return reactive(untheme.use(mode.value));
  });
  return {
    mode,
    theme,
    tokens,
    resolve: (token: RefToken | SysToken | ModeToken | RoleToken) =>
      untheme.resolve(token, mode.value),
    setTheme: (newTheme: UnthemeSysTokens<RefToken, SysToken>) => {
      theme.value = newTheme;
    },
  };
}

export function useUnthemeRoot() {
  const { tokens } = useUntheme();
  return computed(() => useRoot(tokens.value));
}
