import type { ComputedRef } from "vue";

import { defineNuxtPlugin } from "#app";
import { useHead } from "#imports";
import { computed } from "vue";
import { defineRenderer } from "untheme/css";
import { makeUntheme } from "./client";

/**
 * The Nuxt plugin for untheme. The plugin makes the untheme service over a
 * reactive {@link AppUnthemeConfig} container and provides it as `$untheme`.
 * The plugin also provides a CSS renderer for the same service as
 * `$unthemeRenderer`.
 *
 * The plugin keeps the container in {@link useState}. The patch and the
 * selection go from the server to the client. The base theme is the build
 * module. Vue tracks each read and write of the container. The plugin injects
 * the active token set as CSS custom properties. The block renders again when
 * the patch or the selection changes. The
 * plugin also sets the selected context of each modifier on the document root
 * as a `data-<modifier>` attribute.
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
