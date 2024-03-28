import { defineNuxtPlugin, useUntheme } from "#imports";

export default defineNuxtPlugin(() => {
  const { root } = useUntheme();
  useHead({
    style: [
      {
        innerHTML: () => root.value,
      },
    ],
  });
});
