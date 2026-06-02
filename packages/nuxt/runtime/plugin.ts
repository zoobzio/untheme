import { defineNuxtPlugin } from "#app";
import { useHead } from "#imports";
import { computed } from "vue";
import { generateCSS } from "untheme";
import { useTheme } from "./composable";

/**
 * Nuxt plugin that injects the active theme as CSS custom properties
 * and applies the dark mode class to the document root.
 */
export default defineNuxtPlugin({
  name: "untheme",
  setup: () => {
    const { mode, tokens } = useTheme();
    useHead({
      htmlAttrs: {
        class: computed(() => (mode.value === "dark" ? " dark" : "")),
      },
      style: computed(() => [
        {
          key: "untheme",
          innerHTML: generateCSS(tokens.value),
        },
      ]),
    });
  },
});
