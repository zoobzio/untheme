import { defineNuxtModule } from "@nuxt/kit";
import { useColorPack, useColorTheme, useCoreTheme, useTokens } from "untheme";

export interface UnthemeNuxtConfig {
}

export default defineNuxtModule<UnthemeNuxtConfig[]>({
  meta: {
    name: '@untheme/nuxt',
    configKey: 'themes',
  },
  defaults: [],
  async setup() {

    let test = useCoreTheme({
      tokens: {
          paddingSmall: "12px"
      }
    });

    let colors = useColorTheme({
      mode: "dark",
      scheme: useColorPack("tailwind"),
      roles: {
        primary: {
          color: "orange",
          light: 500,
          dark: 600
        }
      }
    })
    
    let tokens = useTokens();
    console.log(tokens);
    
    test.editToken("paddingSmall", "16px");
    console.log(tokens);

    colors.toggleColorMode();
    console.log(tokens);
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