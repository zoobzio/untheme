import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

import untheme from "./untheme.config";

/**
 * Material Design 2 example.
 *
 * Same wiring as the M3 example, against the leaner M2 token vocabulary
 * (primary / secondary with a `-variant`, flat surfaces, elevation via
 * shadow). The theme catalog and initial selection live in `untheme.config.ts`.
 */
const src = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2025-06-23",
  modules: ["@untheme/nuxt"],
  // The runtime plugin pulls untheme into the app bundle, where Vite must
  // compile real ESM — not a `unbuild --stub` jiti shim. Aliasing the libs to
  // their TypeScript source lets Vite transpile them directly, so the example
  // works whether the workspace is stubbed (`pnpm dev`) or fully built.
  // Anchored regexes keep `untheme` from also matching `untheme/css`.
  vite: {
    resolve: {
      alias: [
        {
          find: /^untheme$/,
          replacement: src("../../packages/untheme/src/index.ts"),
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
      ],
    },
  },
  untheme,
});
