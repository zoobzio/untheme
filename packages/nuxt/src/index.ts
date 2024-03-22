import { defineNuxtModule, logger } from "@nuxt/kit";
import { loadUnthemeConfig, defineUntheme } from "untheme";

export type UnthemeNuxtConfig = {
  src: string;
};

export default defineNuxtModule<UnthemeNuxtConfig>({
  meta: {
    name: "@untheme/nuxt",
    configKey: "untheme",
  },
  defaults: {
    src: "untheme.config",
  },
  async setup({ src }, nuxt) {
    try {
      const config = await loadUnthemeConfig(src);
      const untheme = defineUntheme(config);
      logger.error(config, untheme("light").listTokens());
    } catch (err) {
      logger.error("Could not initialize Untheme!", err);
    }
  },
});

declare module "@nuxt/schema" {
  interface NuxtConfig {
    untheme?: UnthemeNuxtConfig;
  }
  interface NuxtOptions {
    untheme?: UnthemeNuxtConfig;
  }
}
