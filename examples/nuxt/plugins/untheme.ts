import { useRootCSSVars } from "untheme";
import useUntheme from "../untheme.config";

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode();
  const theme = computed(() => useUntheme(colorMode.value as "light" | "dark"));
  const root = computed(() => useRootCSSVars(theme.value.getTokens()));
  useHead({
    style: [
      {
        innerHTML: () => root.value,
      },
    ],
  });
});
