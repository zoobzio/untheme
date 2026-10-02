import type { Template } from "untheme";
import type { UnthemeConfig } from "untheme/config";

/**
 * The module's configuration. The theme is always authored as DTCG JSON that
 * an `@untheme/kit` config points at; the module takes it one of two ways —
 *
 * - **Built here.** With no `theme`, the module loads the app's own
 *   `untheme.config.ts` and builds it through the kit at build time. No
 *   options are needed at all.
 * - **Built elsewhere.** Pass the `theme` and `input` a kit build already
 *   generated — a theme package in a monorepo, or a published one:
 *
 *   ```ts
 *   import config from "@acme/theme/config";
 *
 *   export default defineNuxtConfig({
 *     untheme: { ...config },
 *   });
 *   ```
 *
 * When more than one Nuxt layer sets `untheme`, the closest layer's value is
 * used whole — options are never merged across layers.
 *
 * Generic over the template so authoring infers the token and modifier
 * unions; the module itself consumes it at the root `Template`, since a Nuxt
 * module cannot carry a generic through `nuxt.config`.
 */
export interface NuxtUnthemeConfig<
  T extends Template = Template,
> extends Partial<UnthemeConfig<T>> {
  /**
   * The kit config to build from, relative to the project root. Defaults to
   * `untheme.config.ts`. Ignored when a `theme` is passed.
   */
  config?: string;

  /**
   * Whether the generated static cascade (`#build/untheme.css`) is linked
   * into the app's global CSS. On by default, so the token custom properties
   * exist as real CSS — before hydration, without JavaScript, and for any
   * stylesheet authored against them. Set `false` to keep the file out of
   * the bundle; it is still written to the build directory for editor
   * indexing and manual `@import "#build/untheme.css"`.
   */
  css?: boolean;
}

/**
 * Identity helper that types a Nuxt untheme configuration and infers the
 * token and modifier unions from `theme`.
 *
 * @param config - The Nuxt untheme configuration.
 * @returns The same config, narrowed to its inferred types.
 */
export const defineUnthemeConfig = <T extends Template>(
  config: NuxtUnthemeConfig<T>,
) => config;
