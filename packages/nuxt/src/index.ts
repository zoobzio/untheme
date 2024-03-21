import { defineNuxtModule } from "@nuxt/kit";
import { type UnthemeConfig } from "untheme";

export type UnthemeNuxtConfig<Config = unknown> = Config extends UnthemeConfig<infer RefToken, infer SysToken> ? UnthemeConfig<RefToken, SysToken> : { refTokens: Record<string, string>, sysTokens: Record<string, string> };

export default defineNuxtModule<UnthemeNuxtConfig>({
  meta: {
    name: "@untheme/nuxt",
    configKey: "untheme",
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
