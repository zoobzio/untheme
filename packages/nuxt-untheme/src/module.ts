import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImportsDir,
  addTemplate,
  addTypeTemplate,
} from "@nuxt/kit";
import type { UnthemeTemplate } from "untheme";

function _tokenize(object: Record<string, unknown> = {}) {
  if (Object.keys(object).length === 0) {
    return "never";
  }
  return Object.keys(object)
    .map((k) => `"${k}"`)
    .join(" | ");
}

export default defineNuxtModule<UnthemeTemplate>({
  meta: {
    name: "nuxt-untheme",
    configKey: "untheme",
  },
  setup(options) {
    const { resolve } = createResolver(import.meta.url);

    addTemplate({
      filename: "untheme.config.mjs",
      getContents: () => `export default ${JSON.stringify(options)};`,
    });
    addTypeTemplate({
      filename: "types/untheme.d.ts",
      getContents: () =>
        [
          `export type RefToken = ${_tokenize(options.tokens)};`,
          `export type SysToken = ${_tokenize(options.theme)};`,
          `export type ModeToken = ${_tokenize(options.modes.dark)};`,
          `export type RoleToken = ${_tokenize(options.roles)};`,
        ].join("\n"),
    });

    addImportsDir(resolve("../runtime/utils"));
    addPlugin({
      src: resolve("../runtime/plugin"),
    });
  },
});
