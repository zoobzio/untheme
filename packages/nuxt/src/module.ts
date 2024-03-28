import {
  defineNuxtModule,
  addTemplate,
  createResolver,
  addPlugin,
  addImportsDir,
  addTypeTemplate,
} from "@nuxt/kit";
import type { UnthemeNuxtOptions } from "./types";

export default defineNuxtModule<UnthemeNuxtOptions>({
  meta: {
    name: "@untheme/nuxt",
    configKey: "untheme",
  },
  setup(options, nuxt) {
    addTemplate({
      filename: "untheme.config.mjs",
      getContents: () => `
      import untheme from "${nuxt.options.rootDir}/${options.path || "untheme.config"}";

      export default untheme;`,
    });

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      getContents: () => /** .ts **/ `
      import untheme from "${nuxt.options.rootDir}/${options.path || "untheme.config"}";
      type UnthemeConfig = typeof untheme;
      export { type UnthemeConfig };`,
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
