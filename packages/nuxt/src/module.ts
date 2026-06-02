import type { NuxtUnthemeConfig } from "./types";
import {
  defineNuxtModule,
  addTemplate,
  addTypeTemplate,
  addPlugin,
  addImports,
  addServerHandler,
  createResolver,
  useLogger,
} from "@nuxt/kit";

export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: (options) => {
    const logger = useLogger();
    const resolver = createResolver(import.meta.url);

    const theme = options.themes[options.default];
    if (theme === undefined) {
      logger.fatal(`${options.default} is not a valid theme.`);
      throw new Error("Invalid default theme");
    }

    const themes = Object.entries(options.themes).map(([key, { label }]) => ({
      key,
      label,
    }));

    const tokens = {
      reference: Object.keys(theme.reference),
      system: Object.keys(theme.modes.light),
      roles: Object.keys(theme.roles),
    };

    const tokenize = (values: string[]) =>
      values.map((v) => `"${v}"`).join(" | ");

    addTemplate({
      filename: "untheme.config.mjs",
      write: true,
      getContents: () =>
        [
          `export const key = "${options.default}";`,
          `export const theme = ${JSON.stringify(theme)};`,
          `export const themes = ${JSON.stringify(themes)};`,
          `export const tokens = ${JSON.stringify(tokens)};`,
        ].join("\n"),
    });

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      write: true,
      getContents: () =>
        [
          `export type ReferenceToken = ${tokenize(tokens.reference)};`,
          `export type SystemToken = ${tokenize(tokens.system)};`,
          `export type RoleToken = ${tokenize(tokens.roles)};`,
          `export type Theme = ${tokenize(themes.map(({ key }) => key))};`,
        ].join("\n"),
    });

    addServerHandler({
      route: "/api/theme/:theme",
      handler: resolver.resolve("../runtime/server/untheme"),
    });

    addPlugin({
      src: resolver.resolve("../runtime/plugin"),
    });

    addImports([
      {
        from: resolver.resolve("../runtime/composable"),
        name: "useTheme",
      },
    ]);
  },
});
