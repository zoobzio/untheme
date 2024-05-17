import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImportsDir,
  addTemplate,
  addTypeTemplate,
  installModule,
} from "@nuxt/kit";
import type { UnthemeTemplate } from "untheme";

export type UnthemeNuxtOptions = {
  config: string | UnthemeTemplate;
};

export default defineNuxtModule<UnthemeNuxtOptions>({
  meta: {
    name: "@untheme/nuxt",
    configKey: "untheme",
  },
  defaults: {
    config: "untheme.config",
  },
  setup({ config }, nuxt) {
    installModule("@nuxtjs/color-mode"),
      addTemplate({
        filename: "untheme.config.mjs",
        getContents: () => {
          if (typeof config === "string") {
            return [
              `import untheme from "${nuxt.options.rootDir}/${config}";`,
              `export default untheme;`,
            ].join("\n");
          } else {
            return [
              `import { defineUnthemeConfig } from "untheme";`,
              `export default defineUnthemeConfig(${JSON.stringify(config)});`,
            ].join("\n");
          }
        },
      });

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      getContents: () => {
        if (typeof config === "string") {
          return [
            `import untheme from "${nuxt.options.rootDir}/${config}";`,
            `export type UnthemeConfig = typeof untheme;`,
          ].join("\n");
        } else {
          return [
            `import { defineUnthemeConfig } from "untheme";`,
            `const untheme = defineUnthemeConfig(${JSON.stringify(config)});`,
            `export type UnthemeConfig = typeof untheme;`,
          ].join("\n");
        }
      },
    });

    const { resolve } = createResolver(import.meta.url);
    addImportsDir(resolve("../runtime/utils"));
    addPlugin({
      src: resolve("../runtime/plugin"),
    });
  },
});

declare module "@nuxt/schema" {
  interface NuxtConfig {
    untheme?: UnthemeNuxtOptions;
  }
  interface NuxtOptions {
    untheme?: UnthemeNuxtOptions;
  }
}
