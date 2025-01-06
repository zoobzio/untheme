import { defineNuxtPlugin, useHead } from "#imports";
import { useUnthemeCSSRoot } from "untheme";
import { useUntheme } from "./utils/untheme";

export default defineNuxtPlugin(() => {
  const { config, whitelist } = useUntheme();
  const root = computed(() => useUnthemeCSSRoot(config.value, whitelist.value));
  useHead({
    style: [
      {
        innerHTML: () => root.value,
      },
    ],
  });
});
