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

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      write: true,
      getContents: () =>
        [
          `export type ReferenceToken = "${ref.join('" | "')}";`,
          `export type SystemToken = "${sys.join('" | "')}";`,
          `export type RoleToken = "${role.join('" | "')}";`,
        ].join("\n"),
    });

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

    // Declaration co-located with the `untheme.mjs` data template above: a
    // sibling `.d.mts` overrides TypeScript's inference from the `.mjs`, which
    // would otherwise type the resolved theme as a loose all-`string` object
    // that fails the strict token contract. Written with `addTemplate` because
    // `addTypeTemplate` only accepts `.d.ts`.
    addTemplate({
      filename: "untheme.d.mts",
      write: true,
      getContents: () =>
        [
          `import type { Theme, Layer, Contract } from "untheme";`,
          `import type { ReferenceToken, SystemToken, RoleToken } from "./types/untheme";`,
          `type AppContract = Contract<ReferenceToken, SystemToken, RoleToken>;`,
          `export const theme: Theme<AppContract>;`,
          `export const themes: Record<string, Layer<AppContract>>;`,
        ].join("\n"),
    });

    addPlugin({
      src: resolver.resolve("./runtime/plugin"),
    });

    addImports([
      {
        from: resolver.resolve("./runtime/composable"),
        name: "useUntheme",
      },
      {
        from: resolver.resolve("./runtime/store"),
        name: "accessUntheme",
      },
      ...[
        "AppContract",
        "AppTheme",
        "AppThemeLayer",
        "AppThemes",
        "AppConfig",
        "AppUntheme",
      ].map((name) => ({
        from: resolver.resolve("./runtime/types"),
        name,
        type: true,
      })),
    ]);
  },
});
