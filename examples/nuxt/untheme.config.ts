import { defineConfig } from "@untheme/kit";

/**
 * The app's theme: aurora, as DTCG JSON from its installed package. The
 * `@untheme/nuxt` module finds this file, builds it through `@untheme/kit`
 * at build time, and boots each modifier at the default context aurora's
 * resolver document declares. The palette is the `theme` modifier — all 31
 * of aurora's themes; a `modifiers.theme.contexts` list here would keep only
 * the ones it names.
 */
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
});
