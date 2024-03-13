import { addImportsSources, defineNuxtModule } from "@nuxt/kit";
import { UnthemeCoreConfig, manufactureUntheme } from "untheme";

export default defineNuxtModule<UnthemeCoreConfig>({
    meta: {
        name: 'untheme',
        configKey: 'untheme',
    },
    async setup(options, nuxt) {
        nuxt.hook("ready", () => {
            manufactureUntheme(options);
        });
        addImportsSources({
            from: "untheme",
            imports: ["useUntheme"] as Array<keyof typeof import("untheme")>,
        });
    }
});

declare module '@nuxt/schema' {
    interface NuxtConfig {
      untheme?: UnthemeCoreConfig;
    }
    interface NuxtOptions {
      untheme?: UnthemeCoreConfig;
    }
}