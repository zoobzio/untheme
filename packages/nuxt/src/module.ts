import type { NuxtUnthemeConfig } from "./types";
import { defineSchema } from "untheme";

import {
  defineNuxtModule,
  addTemplate,
  addTypeTemplate,
  addPlugin,
  addImports,
  createResolver,
} from "@nuxt/kit";

/**
 * Nuxt module for untheme.
 *
 * At build time it resolves the configured `preset` and `theme`, deep-merges
 * the
 * `extend` overrides (reference, modes, roles), writes the resolved theme set
 * to
 * `public/themes/*.json`, and registers the `untheme.mjs` build template, the
 * `types/untheme.d.ts` token-type template, the runtime plugin, and the
 * `useTheme` auto-import.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: (options) => {
    const resolver = createResolver(import.meta.url);

    const schema = defineSchema(options.base);
    const ref = Array.from(schema.lexicon.tokens.reference);
    const sys = Array.from(schema.lexicon.tokens.system);
    const role = Array.from(schema.lexicon.tokens.role);
    const keys = Object.keys(options.themes);

    addTemplate({
      filename: "untheme.mjs",
      write: true,
      getContents: () => {
        return [
          `export const theme = ${JSON.stringify(options.base)};`,
          `export const themes = ${JSON.stringify(options.themes)};`,
        ].join("\n");
      },
    });

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      write: true,
      getContents: () =>
        [
          `export type ReferenceToken = "${ref.join('" | "')}";`,
          `export type SystemToken = "${sys.join('" | "')}";`,
          `export type RoleToken = "${role.join('" | "')}";`,
          `export type ThemeKey = "${keys.join('" | "')}";`,
        ].join("\n"),
    });

    addPlugin({
      src: resolver.resolve("./runtime/plugin"),
    });

    addPlugin({
      src: resolver.resolve("./runtime/plugin.server"),
      mode: "server",
    });

    addImports([
      {
        from: resolver.resolve("./runtime/composable"),
        name: "useUntheme",
      },
    ]);
  },
});
