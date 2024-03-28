import { defineUnthemeConfig } from "untheme";

export default defineUnthemeConfig({
  tokens: {
    // colors
    "color-green": "#059669",
    "color-blue": "#0284c7",
    "color-red": "#dc2626",
    "color-yellow": "#FFFF00",
    "color-special": "hsl(272, 61%, 34%)",
    // spacing
    "spacing-lg": "20px",
    "spacing-md": "16px",
    "spacing-sm": "12px",
  },
  themes: {
    light: {
      "color-primary": "color-yellow",
      "color-error": "color-red",
    },
    dark: {
      "color-primary": "color-blue",
      "color-error": "color-green",
    },
  },
  roles: {
    "color-on-primary": "color-primary",
    "color-below-primary": "color-error",
  },
});
