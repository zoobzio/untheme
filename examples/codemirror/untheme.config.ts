import { defineConfig } from "@untheme/kit";

/**
 * Aurora widened with a `syntax-*` token group, as DTCG JSON: the resolver
 * lists aurora's files from its installed package as sets, adds
 * `tokens/syntax.json`, and adds `tokens/syntax-dark.json` to the dark color
 * context. `untheme build` turns it into the modules in `untheme/`.
 */
export default defineConfig({
  source: "./tokens/aurora-syntax.resolver.json",
});
