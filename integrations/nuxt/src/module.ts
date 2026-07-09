import type { Schema, Template, Theme } from "untheme";
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
 * At build time it validates the configured base theme, catalog, and initial
 * selection, writes them to the `untheme.mjs` build template, derives the
 * `Token` union and `Mod` axis structure into the `types/untheme.d.ts` type
 * template, and registers the runtime plugin and the `useUntheme`
 * auto-import.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: (options) => {
    const resolver = createResolver(import.meta.url);

    if (!options.base) {
      throw new Error(
        "untheme: no base theme configured — set `untheme.base` in nuxt.config.",
      );
    }

    const schema: Schema<Theme<Template>> = defineSchema(options.base);
    schema.assert.input(options.input);
    for (const layer of Object.values(options.themes ?? {})) {
      schema.assert.layer(layer);
    }
    const tokens = Array.from(schema.meta.enums.tokens);
    const modifiers = Array.from(schema.meta.enums.modifiers);
    const contexts = schema.meta.enums.contexts;

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      write: true,
      getContents: () => {
        const mod = modifiers
          .map((modifier) => {
            const ctx = Array.from(contexts[modifier])
              .map((context) => `${JSON.stringify(context)}: Overrides`)
              .join("; ");
            return `${JSON.stringify(modifier)}: { ${ctx} }`;
          })
          .join("; ");
        const union = tokens.map((token) => JSON.stringify(token)).join(" | ");
        return [
          `import type { Binding } from "untheme";`,
          `export type Token = ${union || "never"};`,
          `export type Overrides = Partial<Record<Token, Binding>>;`,
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

    addTemplate({
      filename: "untheme.d.mts",
      write: true,
      getContents: () =>
        [
          `import type { Layer, Input, Contract } from "untheme";`,
          `import type { Token, Mod } from "./types/untheme";`,
          `type AppContract = Contract<Token, Mod>;`,
          `export const theme: AppContract;`,
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
