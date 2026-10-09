import type { ComputedRef } from "vue";
import type { AppUnthemeContract } from "./types";

import { defineNuxtPlugin } from "#app";
import { useHead } from "#imports";
import { computed } from "vue";
import { defineRenderer } from "untheme/css";
import { makeNuxtUntheme } from "./client";

/**
 * The Nuxt plugin for untheme. The plugin makes the untheme service over a
 * reactive {@link AppUnthemeConfig} container and provides it as `$untheme`.
 * The plugin also provides a CSS renderer for the same service as
 * `$unthemeRenderer`.
 *
 * The plugin keeps the container in {@link useState}. The patch and the
 * selection go from the server to the client. The base theme is the build
 * module. On the server, the cookies restore the selection and the layer.
 *
 * The base cascade is the linked stylesheet of the module. The plugin sets
 * the selected context of each modifier on the document root as a
 * `data-<modifier>` attribute, which selects the context blocks of that
 * stylesheet. The plugin injects the patch alone as a `<style>` tag: the
 * tokens and the context overrides of the applied layer. The tag is empty
 * when the patch is. The block renders again when the patch changes.
 */
export default defineNuxtPlugin({
  name: "untheme",
  setup: async (nuxtApp) => {
    const untheme = await makeNuxtUntheme(nuxtApp);
    const unthemeRenderer = defineRenderer(untheme);

    // Renders over the base theme, so a render of the patch merges nothing.
    const overrides = defineRenderer<AppUnthemeContract>({
      theme: () => untheme.schema.base,
      tokens: () => untheme.tokens(),
    });

    const htmlAttrs: Record<string, ComputedRef<string>> = {};
    for (const modifier of untheme.modifiers()) {
      htmlAttrs[`data-${modifier}`] = computed(
        () => untheme.config.input[modifier],
      );
    }

    useHead({
      htmlAttrs,
      style: computed(() => {
        const css = overrides.patch(untheme.config.patch);
        return css === "" ? [] : [{ key: "untheme", innerHTML: css }];
      }),
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
