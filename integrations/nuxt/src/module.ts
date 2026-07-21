import type { Layer, Schema, Template, Theme } from "untheme";
import type { NuxtUnthemeConfig } from "./config";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { defineSchema } from "untheme";
import { ROUTE } from "untheme/catalog";

import {
  defineNuxtModule,
  addTemplate,
  addTypeTemplate,
  addPlugin,
  addImports,
  addServerHandler,
  createResolver,
} from "@nuxt/kit";

import { ASSETS, ENTRIES, MOUNT, THEMES } from "./constant";

/**
 * Nuxt module for untheme.
 *
 * At build time it validates the configured base theme, initial selection,
 * and theme catalog; writes the base theme and selection to the
 * `untheme.mjs` build template; derives the `Token` union and `Mod` axis
 * structure into the `types/untheme.d.ts` type template; and registers the
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

    if (!options.theme) {
      throw new Error(
        "untheme: no base theme configured — set `untheme.theme` in nuxt.config.",
      );
    }

    const schema: Schema<Theme<Template>> = defineSchema(options.theme);
    schema.assert.theme(options.theme);
    schema.assert.input(options.input);

    /*
     * The catalog, re-keyed by each layer's own id — the identity the wire
     * protocol lists and retrieves by. Every layer is proven against the
     * contract here, so the routes serve stored payloads without re-proving.
     */
    const catalog: Record<string, Layer<Template>> = {};
    for (const layer of Object.values(options.themes ?? {})) {
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
          `export const theme = ${JSON.stringify(options.theme)};`,
          `export const input = ${JSON.stringify(options.input)};`,
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
          `type AppContract = Contract<Token, Mod>;`,
          `export const theme: AppContract;`,
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
        from: resolver.resolve("./runtime/composable"),
        name: "useUnthemeRenderer",
      },
      {
        from: resolver.resolve("./runtime/store"),
        name: "accessUntheme",
      },
      ...[
        "AppContract",
        "AppTheme",
        "AppThemeLayer",
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
