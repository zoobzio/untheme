import { defineUntheme } from "untheme";
import { useRoot } from "@untheme/kit";
// @ts-expect-error
import { ref, computed, reactive } from "#imports";
// @ts-expect-error
import config from "#build/untheme.config.mjs";
// @ts-expect-error
import type { UnthemeConfig } from "#build/types/untheme.d.ts";

const untheme = defineUntheme(config as UnthemeConfig);
const themes = untheme.themes();
const mode = ref<(typeof themes)[number]>(themes[0]);
const tokens = computed(() => reactive(untheme.use(mode.value)));
const root = computed(() => useRoot(tokens.value));

export function useUntheme() {
  return {
    mode,
    themes,
    tokens,
    root,
  };
}
