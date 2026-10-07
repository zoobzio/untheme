import { defineConfig } from "@untheme/kit";

/**
 * Aurora with an added `syntax-*` token group, as DTCG JSON. The resolver
 * lists the files of aurora from its installed package as sets. The resolver
 * adds `tokens/syntax.json` and adds `tokens/syntax-dark.json` to the dark
 * color context. `untheme build` turns the resolver into the modules in
 * `untheme/`.
 */
export default defineConfig({
  source: "./tokens/aurora-syntax.resolver.json",
});
