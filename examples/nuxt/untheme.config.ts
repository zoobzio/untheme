import { defineConfig } from "@untheme/kit";

/**
 * The theme of the app: aurora, as DTCG JSON from its installed package. The
 * `@untheme/nuxt` module finds this file and builds it through `@untheme/kit`
 * at build time. The module boots each modifier at the default context that
 * the resolver document of aurora declares. The palette is the `theme`
 * modifier, with all 31 themes of aurora. A `modifiers.theme.contexts` list
 * here keeps only the themes that the list names.
 */
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
});
