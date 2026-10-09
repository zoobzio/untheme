import type { Template } from "untheme";
import type { UnthemeConfig } from "untheme/config";

/**
 * The options of the Nuxt module. The theme is DTCG JSON that an
 * `@untheme/kit` config points at. The module takes the theme in one of two
 * ways.
 *
 * - **Built here.** When the options have no `theme`, the module loads the
 *   `untheme.config.ts` of the app and builds it with the kit at build time.
 *   This way needs no options.
 * - **A preset.** Name a package that exports a kit build with `preset`. The
 *   module takes the theme, the selection, the manifest, and the layers from
 *   the package, and serves the layers as a theme catalog.
 *
 *   ```ts
 *   export default defineNuxtConfig({
 *     untheme: { preset: "@untheme/aurora" },
 *   });
 *   ```
 *
 * - **Built elsewhere.** Pass the `theme` and `input` that a kit build
 *   generated. The build can come from a theme package in a monorepo or from a
 *   published theme package.
 *
 *   ```ts
 *   import config from "@acme/theme/config";
 *
 *   export default defineNuxtConfig({
 *     untheme: { ...config },
 *   });
 *   ```
 *
 * When the build has layers, from a preset or from the kit config,
 * `useUnthemeCatalog()` lists them and loads one on demand.
 *
 * When more than one Nuxt layer sets `untheme`, the module uses the value of
 * the closest layer as a whole.
 *
 * The type parameter `T` is the template. It lets the token and modifier
 * unions be inferred when you write the options.
 */
export interface NuxtUnthemeConfig<
  T extends Template = Template,
> extends Partial<UnthemeConfig<T>> {
  /**
   * The path of the kit config to build from, relative to the project root.
   * The default is `untheme.config.ts`. The module reads this option only when
   * the options have no `theme` and no `preset`.
   */
  config?: string;

  /**
   * A package that exports a kit build, such as `@untheme/aurora`. The module
   * reads this option only when the options have no `theme`.
   */
  preset?: string;
}

/**
 * Types a Nuxt untheme configuration. The function infers the token and
 * modifier unions from `theme`.
 *
 * @returns The same config, with the inferred types.
 */
export const defineUnthemeConfig = <T extends Template>(
  config: NuxtUnthemeConfig<T>,
) => config;
