import type { Schema, Template, Theme } from "untheme";
import type { NuxtUnthemeConfig } from "./config";

import { join } from "node:path";

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
 * Nuxt module for untheme.
 *
 * Its theme is always DTCG JSON built by `@untheme/kit`: either the app's own
 * `untheme.config.ts`, built here, or the `theme` and `input` a kit build
 * elsewhere already generated, passed in. When more than one Nuxt layer sets
 * `untheme`, the closest layer's value is used whole. At build time the module
 * validates the base theme and initial selection; writes the kit's `index`
 * and `config` modules — the `Token` union, the `Mod` axis structure, the
 * theme and the selection — as build templates under `untheme/`; renders the static
 * cascade to the `untheme.css` template, linked into the app CSS unless
 * `css: false` opts out; and registers the runtime plugin and the
 * `useUntheme` and `useUnthemeRenderer` auto-imports.
 *
 * It registers no server routes. An app that serves a theme catalog mounts
 * one itself, in a server route file of its choosing, with
 * `createThemeHandler` from `@untheme/nuxt/server` (or
 * `createAuroraThemeHandler` from `@untheme/nuxt/aurora`).
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url);

    const config = closest(options, nuxt);
    const { theme, input } = await loadTheme(config, nuxt);

    const schema: Schema<Theme<Template>> = defineSchema(theme);
    schema.assert.theme(theme);
    schema.assert.input(input);

    /*
     * The theme modules, exactly as `untheme build` writes them: `index`
     * carries the `Token` union, the `Mod` structure and the guards, `config`
     * the base theme and boot selection. One generator — the kit's — serves
     * the CLI and this module, so an app importing `#build/untheme/*` and a
     * package importing a kit build see the same modules.
     */
    for (const file of emit({ theme, input })) {
      addTemplate({
        filename: `${MODULES}/${file.path}`,
        write: true,
        getContents: () => file.contents,
      });
    }

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
      config: { theme },
      tokens: () => map(theme.tokens, (slot) => slot.$value),
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
