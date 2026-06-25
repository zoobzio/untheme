import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

import dracula from "@untheme/material-3/themes/dracula";
import nord from "@untheme/material-3/themes/nord";
import tokyoNight from "@untheme/material-3/themes/tokyo_night";
import catppuccin from "@untheme/material-3/themes/catppuccin";
import gruvbox from "@untheme/material-3/themes/gruvbox";
import rosePine from "@untheme/material-3/themes/rose_pine";

/**
 * Material Design 3 example.
 *
 * `base` is the theme the app boots with; `themes` is the catalog the
 * `useUntheme().apply(key)` switcher chooses from. Every entry is a complete
 * M3 theme from `@untheme/material-3` — the module flattens its tokens into
 * `--token` CSS variables for the active mode on every render.
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
  untheme: {
    base: dracula,
    themes: {
      dracula,
      nord,
      tokyo_night: tokyoNight,
      catppuccin,
      gruvbox,
      rose_pine: rosePine,
    },
  },
});
