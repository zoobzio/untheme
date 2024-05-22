import { defineNuxtPlugin, useUntheme, useHead, computed } from "#imports";
import { useRoot } from "@untheme/kit";

export default defineNuxtPlugin(() => {
  const { tokens } = useUntheme();
  const root = computed(() => useRoot(tokens.value));
  useHead({
    style: [
      {
        innerHTML: () => root.value,
      },
    ],
  });
});
