import { defineUntheme } from "untheme";
import { useRoot } from "@untheme/kit";
import { useState } from "#app";
import { computed, reactive } from "vue";
import config from "#build/untheme.config.mjs";
const untheme = defineUntheme(config);
const themes = untheme.themes();
export const useThemes = () => themes;
export const useTheme = () => useState("theme", () => themes[0]);
export const useMode = () => useState("colormode", () => "dark");
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
