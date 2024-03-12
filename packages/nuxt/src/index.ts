import { defineNuxtModule } from "@nuxt/kit";
import { type UserConfig, useUntheme, defineUnthemeConfig } from "untheme";

export default defineNuxtModule<UserConfig>({
    meta: {
        name: 'untheme',
        configKey: 'untheme',
    },
    async setup(options, nuxt) {
        
        /*addImportsSources({
            from: 'untheme',
            imports: ['useUntheme', "defineUnthemeConfig", "useColorPack"] as Array<keyof typeof import('untheme')>,
        });*/
    }
});

declare module '@nuxt/schema' {
    interface NuxtConfig {
      untheme?: UserConfig;
    }
    interface NuxtOptions {
      untheme?: UserConfig;
    }
}