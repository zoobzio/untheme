import { useColorPack } from "untheme";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@untheme/nuxt"],

  untheme: {
    prefix: "z",
    colors: {
      ...useColorPack("tailwind")
    }
  }
})
