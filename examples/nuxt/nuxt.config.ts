import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

/**
 * The showcase. The theme example is the preset: mantis, a palette over
 * aurora, with every theme of aurora as a layer. The module takes its build
 * from the installed package, and the theme picker imports a layer on demand.
 */
const src = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2026-07-01",
  modules: ["@untheme/nuxt"],
  untheme: { preset: "@untheme/example-theme" },
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: ["constants", "types"],
  },
  // The runtime plugin bundles untheme into the app. The aliases point the
  // libraries at their TypeScript source, and Vite compiles that source. The
  // aliases work with a stubbed workspace (`pnpm dev`) and a built workspace.
  // Each regex is anchored to match one package path.
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
