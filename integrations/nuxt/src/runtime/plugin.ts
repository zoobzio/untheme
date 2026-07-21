import type { ComputedRef } from "vue";

import { defineNuxtPlugin } from "#app";
import { useHead } from "#imports";
import { computed } from "vue";
import { defineRenderer } from "untheme/css";
import { makeUntheme } from "./client";

/**
 * Nuxt plugin that builds the untheme service over an SSR-serializable,
 * reactive {@link AppConfig} container and provides it as `$untheme`, alongside
 * a CSS renderer bound to the same service as `$unthemeRenderer`.
 *
 * The container is held in {@link useState} so the active selection and theme
 * survive the server→client transfer; the service mutates it in place and Vue
 * tracks every read and write. The active token set is injected as CSS custom
 * properties — the renderer reads the service inside a computed, so the block
 * re-renders when the selection, theme, or override changes. The selected
 * context of each modifier is mirrored onto the document root as a
 * `data-<modifier>` attribute, a hook for user stylesheets to target
 * (`[data-color="dark"] .card { … }`); the tokens resolve on their own.
 */
export default defineNuxtPlugin({
  name: "untheme",
  setup: async (nuxtApp) => {
    const untheme = makeUntheme(nuxtApp);
    const unthemeRenderer = defineRenderer(untheme);

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
          innerHTML: unthemeRenderer.root(),
        },
      ]),
    });

    await nuxtApp.callHook("untheme:ready", untheme);

    return {
      provide: {
        untheme,
        unthemeRenderer,
      },
    };
  },
});
