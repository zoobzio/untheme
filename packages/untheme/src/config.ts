import type { Input, Layer, Template, Theme } from "@untheme/schema";

/**
 * An application's untheme configuration: the base theme carrying the
 * contract and its default bindings, the catalog of switchable layers, and
 * the selection to boot with — one context per modifier. The canonical
 * shape every integration consumes, conventionally authored in an
 * `untheme.config.ts`.
 */
export interface UnthemeConfig<T extends Template = Template> {
  /**
   * The complete base theme: every token with its `$type` and `$value`, and
   * each modifier's contexts.
   */
  base: Theme<T>;

  /**
   * The catalog of switchable layers, keyed by name; each layer states only
   * what diverges from `base`.
   */
  themes: Record<string, Layer<T>>;

  /**
   * The selection to boot with: one context per modifier.
   */
  input: Input<T>;
}

/**
 * Identity helper that types an untheme configuration and infers the token
 * and modifier unions from `base`.
 *
 * @param config - The untheme configuration.
 * @returns The same config, narrowed to its inferred types.
 */
export const defineUnthemeConfig = <T extends Template>(
  config: UnthemeConfig<T>,
) => config;
