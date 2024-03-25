// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: [
    "@unocss/reset/tailwind.css"
  ],

  modules: ["@nuxtjs/color-mode", "@unocss/nuxt"],

  colorMode: {
    preference: "dark",
  },
});
