import { defineNuxtModule } from "@nuxt/kit";
import { useCoreTheme, useColorTheme, useColorPack } from "untheme";

export interface UnthemeNuxtConfig {
}

export default defineNuxtModule<UnthemeNuxtConfig[]>({
  meta: {
    name: '@untheme/nuxt',
    configKey: 'themes',
  },
  defaults: [],
  async setup() {
    const tokens =  {
      paddingSmall: "8px"
    };

    const untheme = useCoreTheme({
      prefix: "z",
      tokens
    });

    console.log(untheme.resolveToken("paddingSmall"));
    untheme.editToken("paddingSmall", "16px");
    console.log(untheme.resolveToken("paddingSmall"));

    const test = useColorTheme({
      prefix: "color",
      colors: {
        mode: "dark",
        scheme: useColorPack("tailwind"),
        roles: {
          primary: {
            color: "orange",
            dark: 600,
            light: 500
          }
        }
      }
    });
  }
});

declare module '@nuxt/schema' {
    interface NuxtConfig {
      themes?: UnthemeNuxtConfig[];
    }
    interface NuxtOptions {
      themes?: UnthemeNuxtConfig[];
    }
}