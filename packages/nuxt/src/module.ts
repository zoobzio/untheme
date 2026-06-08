import type { NuxtUnthemeConfig } from "./types";

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  defineNuxtModule,
  addTemplate,
  addTypeTemplate,
  addPlugin,
  addImports,
  createResolver,
  useNuxt,
} from "@nuxt/kit";
import { presets } from "./preset";
import { Theme } from "untheme";

/**
 * Nuxt module for untheme.
 *
 * At build time it resolves the configured `preset` and `theme`, deep-merges the
 * `extend` overrides (reference, modes, roles), writes the resolved theme set to
 * `public/themes/*.json`, and registers the `untheme.mjs` build template, the
 * `types/untheme.d.ts` token-type template, the runtime plugin, and the
 * `useTheme` auto-import.
 */
export default defineNuxtModule<NuxtUnthemeConfig>({
  meta: {
    name: "untheme",
    configKey: "untheme",
  },
  setup: ({ preset, theme, extend }) => {
    const nuxt = useNuxt();
    const resolver = createResolver(import.meta.url);

    const themes = presets[preset];
    if (!themes) {
      throw new Error("Invalid preset");
    }

    const isThemeKey = (v: string): v is keyof typeof themes => v in themes;
    if (!isThemeKey(theme)) {
      throw new Error("Invalid theme");
    }

    const def = themes[theme];
    const merged: Theme<string, string, string> = {
      preset,
      key: def.key,
      label: def.label,
      reference: {
        ...def.reference,
        ...(extend.reference ?? {}),
      },
      modes: {
        light: {
          ...def.modes.light,
          ...(extend.modes?.light ?? {}),
        },
        dark: {
          ...def.modes.dark,
          ...(extend.modes?.dark ?? {}),
        },
      },
      roles: extend.roles ?? {},
    };

    const ref = Object.keys(merged.reference);
    const sys = Object.keys(merged.modes.dark);
    const role = Object.keys(merged.roles);

    const options = Object.values(themes).map(({ key, label }) => ({
      key,
      label,
    }));

    const publicDir = join(
      nuxt.options.srcDir,
      nuxt.options.dir.public,
      "themes",
    );
    mkdirSync(publicDir, { recursive: true });

    writeFileSync(join(publicDir, "options.json"), JSON.stringify(options));

    for (const [, t] of Object.entries(themes)) {
      writeFileSync(join(publicDir, `${t.key}.json`), JSON.stringify(t));
    }

    addTemplate({
      filename: "untheme.mjs",
      write: true,
      getContents: () => {
        return [
          `export const theme = ${JSON.stringify(merged)};`,
          `export const extend = ${JSON.stringify(extend)};`,
          `export const options = ${JSON.stringify(options)};`,
          `export const ref = ${JSON.stringify(ref)};`,
          `export const sys = ${JSON.stringify(sys)};`,
          `export const role = ${JSON.stringify(role)};`,
        ].join("\n");
      },
    });

    addTypeTemplate({
      filename: "types/untheme.d.ts",
      write: true,
      getContents: () =>
        [
          `export type ReferenceToken = "${ref.join('" | "')}";`,
          `export type SystemToken = "${sys.join('" | "')}";`,
          `export type RoleToken = "${role.join('" | "')}";`,
        ].join("\n"),
    });

    addPlugin({
      src: resolver.resolve("./runtime/plugin"),
    });

    addImports([
      {
        from: resolver.resolve("./runtime/composable"),
        name: "useTheme",
      },
    ]);
  },
});
