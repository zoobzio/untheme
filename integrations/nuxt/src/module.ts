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
  createResolver,
} from "@nuxt/kit";

import { emit } from "@untheme/kit";

import { MODULES, STYLESHEET } from "./constant";
import { closest, loadTheme } from "./theme";

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
 *   writes the file for editors and does not link it. The runtime plugin
 *   renders the active tokens.
 * - It registers the runtime plugin and the `useUntheme` and
 *   `useUnthemeRenderer` auto-imports.
 *
 * An app that serves a theme catalog mounts `createThemeHandler` from
 * `@untheme/nuxt/server` in a server route file.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url);

    const config = closest(options, nuxt);
    const { theme, input, manifest } = await loadTheme(config, nuxt);

    const schema: Schema<Theme<Template>> = defineSchema(theme);
    schema.assert.theme(theme);
    schema.assert.input(input);

    /*
     * The theme modules are the same modules that `untheme build` writes.
     * `index` holds the `Token` union, the `Mod` structure, and the guards.
     * `config` holds the base theme and the boot selection. `manifest` holds
     * the name and description of each modifier and context.
     */
    for (const file of emit({ theme, input, ...(manifest && { manifest }) })) {
      addTemplate({
        filename: `${MODULES}/${file.path}`,
        write: true,
        getContents: () => file.contents,
      });
    }

    /*
     * The static cascade holds the base bindings under `:root`. Each modifier
     * context follows as a data-attribute block. The cascade sits in the
     * `untheme` cascade layer. The module writes the file and does not link
     * it. An editor indexes it for completion. An app can import it. The
     * unlayered block that the runtime plugin injects wins over the layer.
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
