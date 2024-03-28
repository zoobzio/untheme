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
import { presetUntheme } from "unocss-preset-untheme";
import config from "./untheme.config";

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
      config,
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
