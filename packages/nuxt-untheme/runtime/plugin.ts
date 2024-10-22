import { defineNuxtPlugin, useHead } from "#imports";
import { useUnthemeRoot } from "./utils/untheme";

export default defineNuxtPlugin(() => {
  const root = useUnthemeRoot();
  useHead({
    style: [
      {
        innerHTML: () => root.value,
      },
    ],
  });
});
