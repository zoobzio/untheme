import { useRootCSSVars } from "untheme";

export default defineNuxtPlugin(() => {
  const { tokens } = useUntheme();
  const root = computed(() => useRootCSSVars(tokens.value));
  useHead({
    style: [
      {
        innerHTML: () => root.value,
      },
    ],
  });
});
