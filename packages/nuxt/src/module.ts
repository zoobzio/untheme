import type { Config } from "untheme";
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

/** Configuration options for the untheme Nuxt module. */
export interface NuxtUnthemeConfig {
  /** The key of the theme to use as the initial active theme. */
  default: string;
  /** A map of theme keys to their {@link Config} definitions. */
  themes: Record<string, Config<string, string, string>>;
}

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
      role: Object.keys(theme.roles),
    };

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
          `type Tokens = ${JSON.stringify(tokens)};`,
          "export type ReferenceToken = Tokens['reference'][number];",
          "export type SystemToken = Tokens['system'][number];",
          "export type RoleToken = Tokens['role'][number];",
          `export type Theme = ${themes.map(({ key }) => `"${key}"`).join(" | ")};`,
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
