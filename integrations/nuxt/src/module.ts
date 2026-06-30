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
 * At build time it validates the configured base theme, writes the base theme,
 * the switchable catalog, and the initial selection to the `untheme.mjs` build
 * template, derives the `Token` union and `Mod` axis structure into the
 * `types/untheme.d.ts` type template, and registers the runtime plugin and the
 * `useUntheme` auto-import.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: (options) => {
    const resolver = createResolver(import.meta.url);

    const schema = defineSchema(options.base);
    const tokens = Array.from(schema.rules.sets.tokens);
    const modifiers = Array.from(schema.rules.sets.modifiers);
    const contexts = schema.rules.sets.contexts;

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      write: true,
      getContents: () => {
        const mod = modifiers
          .map((modifier) => {
            const ctx = Array.from(contexts[modifier])
              .map((context) => `"${context}": Partial<Record<Token, string>>`)
              .join("; ");
            return `"${modifier}": { ${ctx} }`;
          })
          .join("; ");
        return [
          `export type Token = "${tokens.join('" | "')}";`,
          `export type Mod = { ${mod} };`,
        ].join("\n");
      },
    });

    addTemplate({
      filename: "untheme.mjs",
      write: true,
      getContents: () => {
        return [
          `export const theme = ${JSON.stringify(options.base)};`,
          `export const themes = ${JSON.stringify(options.themes)};`,
          `export const input = ${JSON.stringify(options.input)};`,
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
          `import type { Theme, Layer, Input, Contract } from "untheme";`,
          `import type { Token, Mod } from "./types/untheme";`,
          `type AppContract = Contract<Token, Mod>;`,
          `export const theme: Theme<AppContract>;`,
          `export const themes: Record<string, Layer<AppContract>>;`,
          `export const input: Input<AppContract>;`,
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
        "AppInput",
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
