import { defineNuxtPlugin } from "#app";
import { useHead } from "#imports";
import { computed } from "vue";
import { generateCSS } from "untheme/css";
import { makeUntheme } from "./client";

/**
 * Nuxt plugin that builds the untheme service over an SSR-serializable,
 * reactive {@link AppConfig} container and provides it as `$untheme`.
 *
 * The container is held in {@link useState} so the active mode and theme
 * survive the server→client transfer; the service mutates it in place and
 * Vue tracks every read and write. The active token set is injected as CSS
 * custom properties and the `dark` class is toggled on the document root.
 */
export default defineNuxtPlugin({
  name: "untheme",
  setup: (nuxtApp) => {
    const untheme = makeUntheme(nuxtApp);

    useHead({
      htmlAttrs: {
        class: computed(() => (untheme.config.mode === "dark" ? "dark" : "")),
      },
      style: computed(() => [
        {
          key: "untheme",
          innerHTML: generateCSS(untheme.tokens()),
        },
      ]),
    });

    nuxtApp.callHook("untheme:ready", untheme);

    return {
      provide: {
        untheme,
      },
    };
  },
});
