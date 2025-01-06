import type { UnthemeColorMode } from "untheme";
import { defineUntheme } from "untheme";
import { useState } from "#imports";
import { computed, reactive } from "vue";
// @ts-ignore
import unthemeConfig from "#build/untheme.config.mjs";

const { config, theme, mode, whitelist } = unthemeConfig;

const untheme = defineUntheme(config);

export const useUnthemeThemes = untheme.themes;
export const useUnthemeColorModes = untheme.modes;
export const useUnthemeTokenList = untheme.tokens;
export const resolveUnthemeToken = untheme.resolve;

export const useUnthemeTheme = () =>
  useState<ReturnType<typeof untheme.themes>[number]>(
    "utheme-theme",
    () => theme ?? "default",
  );

export const useUnthemeColorMode = () =>
  useState<UnthemeColorMode>("untheme-colormode", () => mode ?? "dark");

export const useUnthemeTokenWhitelist = () =>
  useState<ReturnType<typeof useUnthemeTokenList>>(
    "untheme-whitelist",
    () => whitelist ?? [],
  );

export function useUntheme() {
  const theme = useUnthemeTheme();
  const mode = useUnthemeColorMode();
  const whitelist = useUnthemeTokenWhitelist();
  const config = computed(() => reactive(untheme.use(theme.value, mode.value)));
  return {
    mode,
    theme,
    whitelist,
    config,
    resolve: (token: Parameters<typeof resolveUnthemeToken>[0]) =>
      resolveUnthemeToken(token, theme.value, mode.value),
  };
}
