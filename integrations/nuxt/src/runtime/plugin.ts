import type { ComputedRef } from "vue";

import { defineNuxtPlugin } from "#app";
import { useHead } from "#imports";
import { computed } from "vue";
import { generateRootCSS } from "untheme/css";
import { makeUntheme } from "./client";

/**
 * Nuxt plugin that builds the untheme service over an SSR-serializable,
 * reactive {@link AppConfig} container and provides it as `$untheme`.
 *
 * The container is held in {@link useState} so the active selection and theme
 * survive the server→client transfer; the service mutates it in place and Vue
 * tracks every read and write. The active token set is injected as CSS custom
 * properties and the selected context of each modifier is mirrored onto the
 * document root as a `data-<modifier>` attribute.
 */
export default defineNuxtPlugin({
  name: "untheme",
  setup: (nuxtApp) => {
    const untheme = makeUntheme(nuxtApp);

    const htmlAttrs: Record<string, ComputedRef<string>> = {};
    for (const modifier of untheme.modifiers()) {
      htmlAttrs[`data-${modifier}`] = computed(
        () => untheme.config.input[modifier],
      );
    }

    useHead({
      htmlAttrs,
      style: computed(() => [
        {
          key: "untheme",
          innerHTML: generateRootCSS(untheme.tokens()),
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
