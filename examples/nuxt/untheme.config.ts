import { defineUnthemeNuxtConfig } from "nuxt-untheme/config";
import { useTailwindTokenPack } from "untheme/plugin";

const tailwind = useTailwindTokenPack();

export default defineUnthemeNuxtConfig(
  {
    tokens: {
      ...tailwind.colors.tokens,
      ...tailwind.spacing,
      ...tailwind.radius,
    },
    themes: {
      emerald: tailwind.colors.defineAlias("ui", {
        primary: "emerald",
        surface: "stone",
      }),
      indigo: tailwind.colors.defineAlias("ui", {
        primary: "indigo",
        surface: "slate",
      }),
      cyan: tailwind.colors.defineAlias("ui", {
        primary: "cyan",
        surface: "slate",
      }),
      rose: tailwind.colors.defineAlias("ui", {
        primary: "rose",
        surface: "neutral",
      }),
      warm: tailwind.colors.defineAlias("ui", {
        primary: "orange",
        surface: "yellow",
      }),
      cold: tailwind.colors.defineAlias("ui", {
        primary: "blue",
        surface: "teal",
      }),
    },
    modes: {
      dark: {
        "ui-primary": "ui-primary-500",
        "ui-on-primary": "ui-primary-950",
        "ui-primary-tonal": "ui-primary-300",
        "ui-on-primary-tonal": "ui-primary-900",
        "ui-surface": "ui-surface-900",
        "ui-on-surface": "ui-surface-100",
        "ui-outline": "ui-surface-700",
      },
      light: {
        "ui-primary": "ui-primary-600",
        "ui-on-primary": "ui-primary-50",
        "ui-primary-tonal": "ui-primary-700",
        "ui-on-primary-tonal": "ui-primary-100",
        "ui-surface": "ui-surface-100",
        "ui-on-surface": "ui-surface-900",
        "ui-outline": "ui-surface-300",
      },
    },
    roles: {
      "radius-default": "tw-radius-m",
      "spacing-default": "tw-spacing-m",
    },
  },
  {
    mode: "dark",
    theme: "emerald",
    whitelist: [
      "radius-default",
      "spacing-default",
      "ui-primary",
      "ui-on-primary",
      "ui-primary-tonal",
      "ui-on-primary-tonal",
      "ui-surface",
      "ui-on-surface",
      "ui-outline",
    ],
  },
);
