import type { Schema, Template, Theme } from "untheme";
import type { NuxtUnthemeConfig } from "./config";

import { defineSchema } from "untheme";
import { defineRenderer } from "untheme/css";

import { join } from "node:path";

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

/** A string literal for generated code. The line separators are escaped. */
const literal = (value: string): string =>
  JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

/**
 * Makes the `load` export of the `layers` module and its declaration: one
 * lazy import for each layer, by id. `from` gives the import specifier of a
 * layer. The map is empty when the build has no layers.
 */
const loaders = (
  ids: string[],
  from: (id: string) => string,
): { code: string; types: string } => {
  const entries = ids.map(
    (id) =>
      `  ${literal(id)}: () => import(${literal(from(id))}).then((m) => m.default),`,
  );
  return {
    code: `export const load = {\n${entries.join("\n")}\n};\n`,
    types: [
      'import type { Layer } from "untheme";',
      'import type { Contract } from "./config.mjs";',
      "export declare const load: { readonly [Id in LayerId]: () => Promise<Layer<Contract>> };",
      "",
    ].join("\n"),
  };
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
 * - It writes the modules of the kit as build templates under `untheme/`,
 *   and adds `load` to the `layers` module: one lazy import for each layer.
 *   For a preset the list and the layers are the package's own.
 * - It renders the base cascade to the `untheme.css` template and links it
 *   into the CSS of the app.
 * - It registers the runtime plugin and the `useUntheme`,
 *   `useUnthemeRenderer`, and `useUnthemeCatalog` auto-imports.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url);

    const config = closest(options, nuxt);
    const { theme, input, manifest, layers } = await loadTheme(config, nuxt);

    const schema: Schema<Theme<Template>> = defineSchema(theme);
    schema.assert.theme(theme);
    schema.assert.input(input);

    /*
     * The `layers` module lists the layers and imports one by id. A preset
     * has its own list, so the module re-exports it. The list of a kit config
     * comes from the emitter, with the layer files. The module adds `load`.
     */
    const preset = config.preset;
    const load = loaders(
      layers.map(({ layer }) => layer.id),
      (id) =>
        preset === undefined
          ? `./layers/${id}.json`
          : `${preset}/layers/${id}.json`,
    );
    const append = (path: string, contents: string): string => {
      if (path === "layers.mjs") {
        return contents + load.code;
      }
      if (path === "layers.d.mts") {
        return contents + load.types;
      }
      return contents;
    };

    for (const file of emit({
      theme,
      input,
      ...(manifest && { manifest }),
      ...(preset === undefined && { layers }),
    })) {
      if (preset !== undefined && file.path.startsWith("layers")) {
        continue;
      }
      addTemplate({
        filename: `${MODULES}/${file.path}`,
        write: true,
        getContents: () => append(file.path, file.contents),
      });
    }

    if (preset !== undefined) {
      addTemplate({
        filename: `${MODULES}/layers.mjs`,
        write: true,
        getContents: () =>
          `export { layers, default } from ${literal(`${preset}/layers`)};\n${load.code}`,
      });
      addTemplate({
        filename: `${MODULES}/layers.d.mts`,
        write: true,
        getContents: () =>
          `export { layers, default, type LayerId, type LayerEntry } from ${literal(`${preset}/layers`)};\n${load.types}`,
      });
    }

    /*
     * The base cascade holds the base bindings under `:root` and one block
     * for each modifier context, in the `untheme` cascade layer. The runtime
     * plugin renders only the patch over it.
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
    nuxt.options.css ||= [];
    nuxt.options.css.unshift(join(nuxt.options.buildDir, STYLESHEET));

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
