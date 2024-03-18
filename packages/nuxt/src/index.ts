import { defineNuxtModule } from "@nuxt/kit";
import { useCorePlugin } from "untheme";

export interface UnthemeNuxtConfig {
}

export default defineNuxtModule<UnthemeNuxtConfig[]>({
  meta: {
    name: '@untheme/nuxt',
    configKey: 'themes',
  },
  defaults: [],
  async setup() {
    const untheme = useCorePlugin({
      prefix: "padding",
      tokens: {
        small: "8px",
        medium: "12px",
        large: "16px"
      },
    });

    console.log(untheme.resolveToken("small"));
    untheme.editToken("small", "16px");
    console.log(untheme.resolveToken("small"));

    /*
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

    console.log(test.resolveColorRole("primary"));
    test.setColorMode();
    console.log(test.resolveColorRole("primary"));
    */
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