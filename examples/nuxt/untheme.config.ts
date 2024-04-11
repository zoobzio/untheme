import { defineUnthemeConfig } from "untheme";
import { useColorPack } from "@untheme/colors";

export default defineUnthemeConfig({
  tokens: {
    // colors
    ...useColorPack("tw", ["emerald", "indigo", "fuchsia", "orange"], "-"),
    "color-special": "hsl(272, 61%, 34%)",
    // spacing
    "spacing-lg": "20px",
    "spacing-md": "16px",
    "spacing-sm": "12px",
  },
  themes: {
    light: {
      "color-primary": "tw-emerald-400",
      "color-error": "tw-fuchsia-400",
    },
    dark: {
      "color-primary": "tw-emerald-600",
      "color-error": "tw-fuchsia-600",
    },
  },
  roles: {
    "color-on-primary": "color-primary",
    "color-below-primary": "color-error",
  },
});
