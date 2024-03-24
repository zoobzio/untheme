import useUntheme from "../untheme.config";

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode();
  const theme = computed(() => useUntheme(colorMode.value as "light" | "dark"));
  useHead({
    style: [
      {
        innerHTML: () =>
          `:root { --z-test-token: ${theme.value.resolveToken("primary")} }`,
      },
    ],
  });
});
