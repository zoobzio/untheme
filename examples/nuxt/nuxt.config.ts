import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

/**
 * The aurora showcase.
 *
 * The theme wiring lives in `untheme.config.ts`, which points at aurora's
 * DTCG JSON: the module finds it and builds it through `@untheme/kit`, so
 * no `untheme` options are needed here. The module flattens the active
 * selection's tokens into `--token` CSS variables on every render, and
 * mirrors the selection as `data-<modifier>` attributes on the document
 * root.
 */
const src = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2026-07-01",
  modules: ["@untheme/nuxt"],
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: ["constants", "types"],
  },
  // The runtime plugin pulls untheme into the app bundle, where Vite must
  // compile real ESM — not a `unbuild --stub` jiti shim. Aliasing the libs to
  // their TypeScript source lets Vite transpile them directly, so the example
  // works whether the workspace is stubbed (`pnpm dev`) or fully built.
  // Anchored regexes keep `untheme` from also matching its subpaths.
  vite: {
    resolve: {
      alias: [
        {
          find: /^untheme$/,
          replacement: src("../../packages/untheme/src/index.ts"),
        },
        {
          find: /^untheme\/catalog$/,
          replacement: src("../../packages/untheme/src/catalog.ts"),
        },
        {
          find: /^untheme\/config$/,
          replacement: src("../../packages/untheme/src/config.ts"),
        },
        {
          find: /^untheme\/css$/,
          replacement: src("../../packages/untheme/src/css.ts"),
        },
        {
          find: /^@untheme\/core$/,
          replacement: src("../../packages/core/src/index.ts"),
        },
        {
          find: /^@untheme\/css$/,
          replacement: src("../../packages/css/src/index.ts"),
        },
        {
          find: /^@untheme\/schema$/,
          replacement: src("../../packages/schema/src/index.ts"),
        },
        {
          find: /^@untheme\/utils$/,
          replacement: src("../../packages/utils/src/index.ts"),
        },
        {
          find: /^@untheme\/catalog$/,
          replacement: src("../../packages/catalog/src/index.ts"),
        },
      ],
    },
  },
});
