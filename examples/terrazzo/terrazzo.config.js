import { defineConfig } from "@terrazzo/cli";
import untheme from "@untheme/terrazzo";

/**
 * The aurora preset authored as DTCG token JSON: a resolver document carries
 * the eight modifier axes, and each theme document rebinds the tonal ramps.
 * `tz build` emits `.dist/untheme.config.ts` — the same `theme`/`input`
 * configuration examples/nuxt authors by hand, with the theme documents as
 * a named `themes` catalog export.
 */
export default defineConfig({
  tokens: "./tokens/aurora.resolver.json",
  outDir: "./.dist/",
  plugins: [
    untheme({
      themes: [
        { source: "./themes/abyss.json", name: "Abyss" },
        { source: "./themes/gruvbox.json", name: "Gruvbox" },
        { source: "./themes/nord.json", name: "Nord" },
      ],
    }),
  ],
});
