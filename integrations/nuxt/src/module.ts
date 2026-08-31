import type { Layer, Schema, Template, Theme } from "untheme";
import type { NuxtUnthemeConfig } from "./config";
import type { UnthemeLayerConfig } from "./resolve";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { defineSchema } from "untheme";
import { ROUTE } from "untheme/catalog";
import { defineRenderer } from "untheme/css";

import { map } from "objectively";

import {
  defineNuxtModule,
  addTemplate,
  addTypeTemplate,
  addPlugin,
  addImports,
  addServerHandler,
  createResolver,
} from "@nuxt/kit";

import { ASSETS, ENTRIES, MOUNT, STYLESHEET, THEMES } from "./constant";
import { resolveUnthemeConfig } from "./resolve";

/**
 * Nuxt module for untheme.
 *
 * At build time it resolves the untheme config across Nuxt layers per
 * member, the closest layer winning (Nuxt's own defu merge concatenates
 * arrays, which corrupts array-valued bindings); validates the resolved base
 * theme, initial selection, and theme catalog; writes the base theme and
 * selection to the
 * `untheme.mjs` build template; derives the `Token` union and `Mod` axis
 * structure into the `types/untheme.d.ts` type template; renders the static
 * cascade to the `untheme.css` template, linked into the app CSS unless
 * `css: false` opts out; and registers the
 * runtime plugin and the `useUntheme` and `useUnthemeRenderer` auto-imports.
 * Catalog layers are never
 * bundled with the app: they are written as JSON into the build directory,
 * mounted as nitro server assets, and served over the catalog wire protocol
 * — listings at `${MOUNT}/themes`, payloads at `${MOUNT}/themes/:id`.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: (options, nuxt) => {
    const resolver = createResolver(import.meta.url);

    /*
     * Nuxt merges layer configs with an array-concatenating defu before any
     * module runs, which corrupts array-valued bindings (shadow lists,
     * gradient stops, `cubicBezier` tuples, color components) and duplicates
     * `order`. Each layer's own config survives on `nuxt.options._layers`,
     * so when more than one layer authors an untheme config the module
     * resolves the chain itself, per member, the closest layer winning. A
     * single author keeps the merged options, inline module options
     * included.
     */
    const authored = (nuxt.options._layers ?? [])
      .map(
        (layer) =>
          (layer.config as { untheme?: UnthemeLayerConfig } | null)?.untheme,
      )
      .filter((layerConfig) => layerConfig !== undefined);

    const config =
      authored.length > 1
        ? (resolveUnthemeConfig(authored) as NuxtUnthemeConfig)
        : options;

    if (!config.theme) {
      throw new Error(
        "untheme: no base theme configured — set `untheme.theme` in nuxt.config.",
      );
    }

    const schema: Schema<Theme<Template>> = defineSchema(config.theme);
    schema.assert.theme(config.theme);
    schema.assert.input(config.input);

    /*
     * The catalog, re-keyed by each layer's own id — the identity the wire
     * protocol lists and retrieves by. Every layer is proven against the
     * contract here, so the routes serve stored payloads without re-proving.
     */
    const catalog: Record<string, Layer<Template>> = {};
    for (const layer of Object.values(config.themes ?? {})) {
      schema.assert.layer(layer);
      if (layer.id in catalog) {
        throw new Error(
          `untheme: duplicate theme id "${layer.id}" in \`untheme.themes\`.`,
        );
      }
      catalog[layer.id] = layer;
    }

    const entries = Object.values(catalog).map((layer) => ({
      id: layer.id,
      name: layer.name,
    }));

    /*
     * Theme payloads stay off the app bundle: plain JSON files in the build
     * directory, mounted as nitro server assets — embedded into the server
     * artifact at build time, read from disk in dev. The write waits for
     * `build:before`, which fires after nuxt has cleared the build
     * directory; a write during setup would be wiped.
     */
    const assets = join(nuxt.options.buildDir, ASSETS);

    nuxt.hook("build:before", async () => {
      await mkdir(assets, { recursive: true });
      await writeFile(join(assets, ENTRIES), JSON.stringify(entries));
      await writeFile(join(assets, THEMES), JSON.stringify(catalog));
    });

    nuxt.options.nitro.serverAssets ||= [];
    nuxt.options.nitro.serverAssets.push({ baseName: ASSETS, dir: assets });

    addServerHandler({
      route: `${MOUNT}/${ROUTE}`,
      method: "get",
      handler: resolver.resolve("./runtime/server/list"),
    });

    addServerHandler({
      route: `${MOUNT}/${ROUTE}/:id`,
      method: "get",
      handler: resolver.resolve("./runtime/server/get"),
    });

    const tokens = Array.from(schema.meta.enums.tokens);
    const contexts = schema.meta.enums.contexts;

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      write: true,
      getContents: () => {
        const mod = Object.entries(contexts)
          .map(([modifier, set]) => {
            const ctx = Array.from(set)
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
          `export const theme = ${JSON.stringify(config.theme)};`,
          `export const input = ${JSON.stringify(config.input)};`,
        ].join("\n");
      },
    });

    addTemplate({
      filename: "untheme.d.mts",
      write: true,
      getContents: () =>
        [
          `import type { Contract, Input } from "untheme";`,
          `import type { Token, Mod } from "./types/untheme";`,
          `type AppUnthemeContract = Contract<Token, Mod>;`,
          `export const theme: AppUnthemeContract;`,
          `export const input: Input<AppUnthemeContract>;`,
        ].join("\n"),
    });

    /*
     * The static cascade as a real stylesheet in the build directory: the
     * base bindings under `:root`, then each modifier context as a
     * data-attribute block — `defineRenderer(...).sheet()` over the resolved
     * theme. Written to disk so editors index the custom properties and user
     * CSS can `@import "#build/untheme.css"`, and linked into the app CSS
     * unless `css: false` opts out. The renderer's source is a static
     * container over the validated theme: `sheet()` reads only the theme,
     * and the bindings accessor folds the base values so the other renderer
     * reads stay coherent. The whole cascade sits in the `untheme` cascade
     * layer, so the unlayered block the runtime plugin injects — carrying
     * live overrides and swapped themes — wins every equal-specificity
     * conflict regardless of where this stylesheet lands in the head.
     */
    const renderer = defineRenderer({
      config: { theme: config.theme },
      tokens: () => map(config.theme.tokens, (slot) => slot.$value),
    });

    addTemplate({
      filename: STYLESHEET,
      write: true,
      getContents: () => `@layer untheme {\n${renderer.sheet()}\n}`,
    });

    if (config.css !== false) {
      nuxt.options.css ||= [];
      nuxt.options.css.unshift(join(nuxt.options.buildDir, STYLESHEET));
    }

    addPlugin({
      src: resolver.resolve("./runtime/plugin"),
    });

    addImports([
      {
        from: resolver.resolve("./runtime/composable"),
        name: "useUntheme",
      },
      {
        from: resolver.resolve("./runtime/composable"),
        name: "useUnthemeRenderer",
      },
      {
        from: resolver.resolve("./runtime/store"),
        name: "accessUntheme",
      },
      ...[
        "AppUnthemeContract",
        "AppUnthemeTheme",
        "AppUnthemeThemeLayer",
        "AppUnthemeInput",
        "AppUnthemeConfig",
        "AppUntheme",
      ].map((name) => ({
        from: resolver.resolve("./runtime/types"),
        name,
        type: true,
      })),
    ]);
  },
});
