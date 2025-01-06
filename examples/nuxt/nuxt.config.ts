import { defineNuxtConfig } from "nuxt/config";
import untheme from "./untheme.config";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  modules: ["nuxt-untheme"],
  untheme,
});
