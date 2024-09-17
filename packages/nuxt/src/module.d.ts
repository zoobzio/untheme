import type { UnthemeTemplate } from "untheme";
declare const _default: any;
export default _default;
declare module "@nuxt/schema" {
    interface NuxtConfig {
        untheme?: UnthemeTemplate;
    }
    interface NuxtOptions {
        untheme?: UnthemeTemplate;
    }
}
