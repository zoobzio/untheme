import { defineNuxtModule } from "@nuxt/kit";
import { type UnthemeCoreConfig, useColorPack, useColorPlugin, manufactureUntheme } from "untheme";

export default defineNuxtModule<UnthemeCoreConfig>({
  meta: {
    name: '@untheme/nuxt',
    configKey: 'untheme',
  },
  defaults: {
    prefix: "ut",
    tokens: {},
    plugins: [
      useColorPlugin({
        mode: "dark",
        scheme: useColorPack("tailwind"),
        tokens: {
          primary: {
            color: "emerald",
            dark: 600,
            light: 500
          },
          content: {
            color: "stone",
            dark: 800,
            light: 200
          },
          contrast: {
            color: "stone",
            dark: 900,
            light: 100
          }
        }
      })
    ]
  },
  async setup(options, nuxt) {
    const { tokens, utils } = manufactureUntheme(options);
    console.log(JSON.stringify(tokens, null, 2));
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