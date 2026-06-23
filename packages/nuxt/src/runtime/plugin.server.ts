import type { Mode } from "untheme";
import type { ThemeKey } from "#build/types/untheme.d.ts";

import { defineNuxtPlugin } from "#app";
import { useCookie } from "#imports";
import { themes as buildThemes } from "#build/untheme.mjs";

/**
 * Server-only plugin that restores the persisted selection from cookies into
 * the service before the first render, so the correct mode and theme ride the
 * SSR payload to the client — no hydration flash, no client-side init.
 *
 * Restoration goes through the raw service (it does not re-write the cookie it
 * just read) and emits `untheme:apply` so observers see the initial selection.
 */
export default defineNuxtPlugin({
  name: "untheme:cookie",
  dependsOn: ["untheme"],
  setup: (nuxtApp) => {
    const mode = useCookie<Mode>("untheme-mode");
    const key = useCookie<ThemeKey>("untheme-key");

    if (mode.value) {
      nuxtApp.$untheme.config.mode = mode.value;
    }

    const layer = key.value ? buildThemes[key.value] : undefined;
    if (layer) {
      nuxtApp.$untheme.apply(layer);
      nuxtApp.callHook("untheme:apply", nuxtApp.$untheme.config.theme);
    }
  },
});
