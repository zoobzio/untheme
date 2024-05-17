import { defineUnthemeConfig } from "untheme";
import { useColorPack, referenceColorTokens } from "@untheme/colors";

export default defineUnthemeConfig({
  tokens: {
    // colors
    ...useColorPack(
      "tw",
      ["emerald", "fuchsia", "orange", "red", "stone", "slate"],
      "-"
    ),
    "clr-special": "hsl(272, 61%, 34%)",
    // spacing
    "spacing-lg": "20px",
    "spacing-md": "16px",
    "spacing-sm": "12px",
  },
  themes: {
    default: {
      ...referenceColorTokens("tw", "emerald", "primary", "-"),
      ...referenceColorTokens("tw", "stone", "surface", "-"),
      ...referenceColorTokens("tw", "red", "error", "-"),
      "spacing-default": "spacing-sm"
    },
    example: {
      ...referenceColorTokens("tw", "fuchsia", "primary", "-"),
      ...referenceColorTokens("tw", "slate", "surface", "-"),
      ...referenceColorTokens("tw", "orange", "error", "-"),
      "spacing-default": "spacing-lg"
    },
  },
  modes: {
    light: {
      "clr-primary": "tw-primary-500",
      "clr-surface": "tw-surface-100",
      "clr-content": "tw-surface-950",
      "clr-error": "tw-error-500",
    },
    dark: {
      "clr-primary": "tw-primary-400",
      "clr-surface": "tw-surface-900",
      "clr-content": "tw-surface-50",
      "clr-error": "tw-error-400",
    },
  },
  roles: {},
});
