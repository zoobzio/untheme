import type { AppConfig } from "./types";

import { defineNuxtPlugin } from "#app";
import { useHead, useState } from "#imports";
import { computed } from "vue";
import { defineUntheme } from "untheme";
import { generateCSS } from "untheme/css";
import { theme as buildTheme, themes as buildThemes } from "#build/untheme.mjs";

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
    const config = useState<AppConfig>("untheme", () => ({
      mode: "dark",
      theme: buildTheme,
    }));

    const service = defineUntheme(config.value, buildThemes);

    useHead({
      htmlAttrs: {
        class: computed(() => (service.config.mode === "dark" ? "dark" : "")),
      },
      style: computed(() => [
        {
          key: "untheme",
          innerHTML: generateCSS(service.tokens()),
        },
      ]),
    });

    nuxtApp.callHook("untheme:ready", service.config.theme);

    return {
      provide: {
        untheme: service,
      },
    };
  },
});
