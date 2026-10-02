import { defineConfig } from "@untheme/kit";

/**
 * The app's theme: aurora, as DTCG JSON from its installed package. The
 * `@untheme/nuxt` module finds this file, builds it through `@untheme/kit`
 * at build time, and boots each modifier at the default context aurora's
 * resolver document declares. The themes the switcher offers are served by
 * `server/api/untheme/[...path].get.ts`.
 */
export default defineConfig({
  source: "npm:/@untheme/aurora/aurora.resolver.json",
});
