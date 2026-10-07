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
   * the options have no `theme`.
   */
  config?: string;

  /**
   * Controls whether the module links the static cascade
   * (`#build/untheme.css`) into the global CSS of the app. The default is
   * `true`. With `true`, the token custom properties exist in CSS before
   * hydration. Set `false` to keep the file out of the bundle. The module
   * still writes the file to the build directory, and you can import it with
   * `@import "#build/untheme.css"`.
   */
  css?: boolean;
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
