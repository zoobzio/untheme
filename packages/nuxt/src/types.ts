import type { Theme, Template, Layer } from "untheme";

/**
 * Configuration options for the untheme Nuxt module.
 */
export interface NuxtUnthemeConfig {
  base: Theme<Template>;
  themes: Record<string, Theme<Template>>;
}

export interface NuxtUnthemeUserConfig<T extends Template> {
  base: Theme<T>;
  themes: {
    [key: string]: Layer<T>;
  };
}
