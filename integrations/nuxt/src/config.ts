import type { Layer, Template } from "untheme";
import type { UnthemeConfig } from "untheme/config";

/**
 * The module's configuration: the canonical untheme config every integration
 * consumes, extended with the features the Nuxt module layers over it.
 * Generic over the template so authoring infers the token and modifier
 * unions; the module itself consumes it at the root `Template`, since a Nuxt
 * module cannot carry a generic through `nuxt.config`.
 */
export interface NuxtUnthemeConfig<
  T extends Template = Template,
> extends UnthemeConfig<T> {
  /**
   * The theme catalog: the layers the app's server serves over the catalog
   * wire protocol. Keys are authoring convenience only — each layer's own
   * `id` is the identity it is listed and retrieved under. Payloads are
   * never bundled with the app: the module loads them into nitro's server
   * assets and mounts endpoints that answer listings and retrievals.
   */
  themes?: Record<string, Layer<T>>;
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
