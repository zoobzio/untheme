import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import untheme from "./untheme.config";
import presetUntheme from "unocss-preset-untheme";

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(vue|ts)($|\?)/],
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Inter",
      },
    }),
    presetUntheme({
      tokens: untheme.tokens(),
      templates: {
        colors: /color-(.*)/,
        spacing: /spacing-(.*)/,
      },
    }),
  ],
  transformers: [
    transformerDirectives({
      applyVariable: ["--apply"],
    }),
    transformerVariantGroup(),
  ],
});
