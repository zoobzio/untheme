import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

import untheme from "./untheme.config";

/**
 * The aurora showcase.
 *
 * The theme wiring lives in `untheme.config.ts`: `theme` is the base the app
 * boots with, `themes` is the catalog the module serves over its endpoints —
 * listed for the switcher, fetched on demand when applied, never bundled —
 * and `input` is the initial selection (one context per modifier). The
 * module flattens the active selection's tokens into `--token` CSS variables
 * on every render, and mirrors the selection as `data-<modifier>` attributes
 * on the document root.
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
          find: /^@untheme\/kit$/,
          replacement: src("../../packages/kit/src/index.ts"),
        },
        {
          find: /^@untheme\/catalog$/,
          replacement: src("../../packages/catalog/src/index.ts"),
        },
        {
          find: /^@untheme\/nuxt\/constant$/,
          replacement: src("../../integrations/nuxt/src/constant.ts"),
        },
      ],
    },
  },
  untheme,
});
