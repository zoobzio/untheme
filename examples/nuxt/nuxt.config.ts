import unocss from "./uno.config";
import untheme from "./untheme.config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@unocss/reset/tailwind.css"],
  modules: ["@unocss/nuxt", "@untheme/nuxt"],
  unocss,
  untheme,
});
