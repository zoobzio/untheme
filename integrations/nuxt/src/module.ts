import type { Schema, Template, Theme } from "untheme";
import type { NuxtUnthemeConfig } from "./config";

import { defineSchema } from "untheme";
import { defineRenderer } from "untheme/css";

import { map } from "objectively";

import {
  defineNuxtModule,
  addTemplate,
  addPlugin,
  addImports,
  addServerHandler,
  addServerTemplate,
  createResolver,
} from "@nuxt/kit";

import { emit } from "@untheme/kit";

import { LAYERS, MODULES, ROUTE, STYLESHEET } from "./constant";
import { closest, loadTheme } from "./theme";

/**
 * Reads the `route` option. The default is {@link ROUTE}. The value `false`
 * serves no catalog. A route is an absolute path with no trailing slash.
 */
const catalogRoute = (route: string | false | undefined): string | false => {
  if (route === false) {
    return false;
  }
  if (route === undefined) {
    return ROUTE;
  }
  if (typeof route !== "string" || !route.startsWith("/")) {
    throw new Error(
      "untheme: `route` must be an absolute path, such as /api/untheme, or false",
    );
  }
  return route.replace(/\/+$/, "") || "/";
};

/**
 * The Nuxt module for untheme. The theme is DTCG JSON built by `@untheme/kit`.
 * The module builds the `untheme.config.ts` of the app, or it takes the
 * `theme` and `input` from the options. When more than one Nuxt layer sets
 * `untheme`, the module uses the value of the closest layer as a whole.
 *
 * At build time the module does these steps.
 *
 * - It validates the base theme and the initial selection.
 * - It writes the `index` and `config` modules of the kit as build templates
 *   under `untheme/`. The modules hold the `Token` union, the `Mod` axis
 *   structure, the theme, and the selection.
 * - It renders the static cascade to the `untheme.css` template. The module
 *   writes the file and does not link it.
 * - It registers the runtime plugin and the `useUntheme`,
 *   `useUnthemeRenderer`, and `useUnthemeCatalog` auto-imports.
 * - When the build has layers, it writes the `layers` module and one file for
 *   each layer, and serves them under `route` with the catalog wire protocol.
 *
 * An app that serves themes from another store mounts `createThemeHandler`
 * from `@untheme/nuxt/server` in a server route file of its own.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url);

    const config = closest(options, nuxt);
    const route = catalogRoute(config.route);
    const { theme, input, manifest, layers } = await loadTheme(config, nuxt);

    const schema: Schema<Theme<Template>> = defineSchema(theme);
    schema.assert.theme(theme);
    schema.assert.input(input);

    /*
     * The theme modules are the same modules that `untheme build` writes.
     * `index` holds the `Token` union, the `Mod` structure, and the guards.
     * `config` holds the base theme and the boot selection. `manifest` holds
     * the name and description of each modifier and context.
     */
    for (const file of emit({
      theme,
      input,
      layers,
      ...(manifest && { manifest }),
    })) {
      addTemplate({
        filename: `${MODULES}/${file.path}`,
        write: true,
        getContents: () => file.contents,
      });
    }

    /*
     * The theme catalog. The server template holds the entries and the layers
     * of the build. The handler serves them under the route as a catch-all.
     * The runtime config tells `useUnthemeCatalog` where.
     */
    if (route !== false && layers.length > 0) {
      const entries = layers.map(({ entry }) => entry);
      const byId = Object.fromEntries(
        layers.map(({ layer }) => [layer.id, layer]),
      );
      addServerTemplate({
        filename: LAYERS,
        getContents: () =>
          [
            `export const entries = ${JSON.stringify(entries)};`,
            `export const layers = ${JSON.stringify(byId)};`,
            "",
          ].join("\n"),
      });
      addServerHandler({
        route: `${route === "/" ? "" : route}/**`,
        method: "get",
        handler: resolver.resolve("./runtime/server/catalog"),
      });
      nuxt.options.runtimeConfig.public.untheme = { route };
    }

    /*
     * The static cascade holds the base bindings under `:root` and one block
     * for each modifier context, in the `untheme` cascade layer. The module
     * writes the file and does not link it.
     */
    const renderer = defineRenderer({
      theme: () => theme,
      tokens: () => map(theme.tokens, (slot) => slot.$value),
    });

    addTemplate({
      filename: STYLESHEET,
      write: true,
      getContents: () => `@layer untheme {\n${renderer.sheet()}\n}`,
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
        from: resolver.resolve("./runtime/composable"),
        name: "useUnthemeCatalog",
      },
      {
        from: resolver.resolve("./runtime/store"),
        name: "accessUntheme",
      },
      ...[
        "AppUnthemeContract",
        "AppUnthemeTheme",
        "AppUnthemeThemeLayer",
        "AppUnthemePatch",
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
