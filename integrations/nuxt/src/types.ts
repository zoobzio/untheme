import type { Theme, Template, Layer, Input } from "untheme";

/**
 * Configuration options for the untheme Nuxt module.
 */
export interface NuxtUnthemeConfig {
  base: Theme<Template>;
  themes: Record<string, Layer<Template>>;
  input: Input<Template>;
}

export interface NuxtUnthemeUserConfig<T extends Template> {
  base: Theme<T>;
  themes: {
    [key: string]: Layer<T>;
  };
  input: Input<T>;
}
