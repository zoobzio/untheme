import { defineUnthemePreset } from "@untheme/kit";
import { createM2ColorTokens } from "./colors";

/**
 * The Material Design 2 preset.
 *
 * Reference tokens provide the full M2 token set: color palettes (Tailwind
 * family names as seeds with 50–900 + A100–A700 shades), typography scales,
 * shape radii, elevation shadows, and motion easing/duration values. System
 * tokens map color references to semantic roles per light/dark mode following
 * the M2 color system specification.
 */
export const preset = defineUnthemePreset({
  id: "material-2",
  name: "Material 2",
  reference: {
    // Chromatic palettes
    ...createM2ColorTokens("red", "#ef4444"),
    ...createM2ColorTokens("orange", "#f97316"),
    ...createM2ColorTokens("amber", "#f59e0b"),
    ...createM2ColorTokens("yellow", "#eab308"),
    ...createM2ColorTokens("lime", "#84cc16"),
    ...createM2ColorTokens("green", "#22c55e"),
    ...createM2ColorTokens("emerald", "#10b981"),
    ...createM2ColorTokens("teal", "#14b8a6"),
    ...createM2ColorTokens("cyan", "#06b6d4"),
    ...createM2ColorTokens("sky", "#0ea5e9"),
    ...createM2ColorTokens("blue", "#3b82f6"),
    ...createM2ColorTokens("indigo", "#6366f1"),
    ...createM2ColorTokens("violet", "#8b5cf6"),
    ...createM2ColorTokens("purple", "#a855f7"),
    ...createM2ColorTokens("fuchsia", "#d946ef"),
    ...createM2ColorTokens("pink", "#ec4899"),
    ...createM2ColorTokens("rose", "#f43f5e"),
    // Neutral palettes
    ...createM2ColorTokens("slate", "#64748b"),
    ...createM2ColorTokens("gray", "#6b7280"),
    ...createM2ColorTokens("zinc", "#71717a"),
    ...createM2ColorTokens("neutral", "#737373"),
    ...createM2ColorTokens("stone", "#78716c"),
    // Typography — typeface reference
    "font-default": "Roboto, sans-serif",
    // Typography — headline
    "headline-1-size": "96px",
    "headline-1-line-height": "112px",
    "headline-1-weight": "300",
    "headline-1-tracking": "-1.5px",
    "headline-2-size": "60px",
    "headline-2-line-height": "72px",
    "headline-2-weight": "300",
    "headline-2-tracking": "-0.5px",
    "headline-3-size": "48px",
    "headline-3-line-height": "56px",
    "headline-3-weight": "400",
    "headline-3-tracking": "0px",
    "headline-4-size": "34px",
    "headline-4-line-height": "40px",
    "headline-4-weight": "400",
    "headline-4-tracking": "0.25px",
    "headline-5-size": "24px",
    "headline-5-line-height": "32px",
    "headline-5-weight": "400",
    "headline-5-tracking": "0px",
    "headline-6-size": "20px",
    "headline-6-line-height": "28px",
    "headline-6-weight": "500",
    "headline-6-tracking": "0.15px",
    // Typography — subtitle
    "subtitle-1-size": "16px",
    "subtitle-1-line-height": "24px",
    "subtitle-1-weight": "400",
    "subtitle-1-tracking": "0.15px",
    "subtitle-2-size": "14px",
    "subtitle-2-line-height": "20px",
    "subtitle-2-weight": "500",
    "subtitle-2-tracking": "0.1px",
    // Typography — body
    "body-1-size": "16px",
    "body-1-line-height": "24px",
    "body-1-weight": "400",
    "body-1-tracking": "0.5px",
    "body-2-size": "14px",
    "body-2-line-height": "20px",
    "body-2-weight": "400",
    "body-2-tracking": "0.25px",
    // Typography — button
    "button-size": "14px",
    "button-line-height": "20px",
    "button-weight": "500",
    "button-tracking": "1.25px",
    // Typography — caption
    "caption-size": "12px",
    "caption-line-height": "16px",
    "caption-weight": "400",
    "caption-tracking": "0.4px",
    // Typography — overline
    "overline-size": "10px",
    "overline-line-height": "16px",
    "overline-weight": "400",
    "overline-tracking": "1.5px",
    // Shape
    "shape-small": "4px",
    "shape-medium": "4px",
    "shape-large": "0px",
    // Elevation (0–24)
    "elevation-0": "none",
    "elevation-1":
      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    "elevation-2":
      "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)",
    "elevation-3":
      "0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)",
    "elevation-4":
      "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
    "elevation-5":
      "0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 5px 8px 0px rgb(0 0 0 / 14%), 0px 1px 14px 0px rgb(0 0 0 / 12%)",
    "elevation-6":
      "0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)",
    "elevation-7":
      "0px 4px 5px -2px rgb(0 0 0 / 20%), 0px 7px 10px 1px rgb(0 0 0 / 14%), 0px 2px 16px 1px rgb(0 0 0 / 12%)",
    "elevation-8":
      "0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)",
    "elevation-9":
      "0px 5px 6px -3px rgb(0 0 0 / 20%), 0px 9px 12px 1px rgb(0 0 0 / 14%), 0px 3px 16px 2px rgb(0 0 0 / 12%)",
    "elevation-10":
      "0px 6px 6px -3px rgb(0 0 0 / 20%), 0px 10px 14px 1px rgb(0 0 0 / 14%), 0px 4px 18px 3px rgb(0 0 0 / 12%)",
    "elevation-11":
      "0px 6px 7px -4px rgb(0 0 0 / 20%), 0px 11px 15px 1px rgb(0 0 0 / 14%), 0px 4px 20px 3px rgb(0 0 0 / 12%)",
    "elevation-12":
      "0px 7px 8px -4px rgb(0 0 0 / 20%), 0px 12px 17px 2px rgb(0 0 0 / 14%), 0px 5px 22px 4px rgb(0 0 0 / 12%)",
    "elevation-13":
      "0px 7px 8px -4px rgb(0 0 0 / 20%), 0px 13px 19px 2px rgb(0 0 0 / 14%), 0px 5px 24px 4px rgb(0 0 0 / 12%)",
    "elevation-14":
      "0px 7px 9px -4px rgb(0 0 0 / 20%), 0px 14px 21px 2px rgb(0 0 0 / 14%), 0px 5px 26px 4px rgb(0 0 0 / 12%)",
    "elevation-15":
      "0px 8px 9px -5px rgb(0 0 0 / 20%), 0px 15px 22px 2px rgb(0 0 0 / 14%), 0px 6px 28px 5px rgb(0 0 0 / 12%)",
    "elevation-16":
      "0px 8px 10px -5px rgb(0 0 0 / 20%), 0px 16px 24px 2px rgb(0 0 0 / 14%), 0px 6px 30px 5px rgb(0 0 0 / 12%)",
    "elevation-17":
      "0px 8px 11px -5px rgb(0 0 0 / 20%), 0px 17px 26px 2px rgb(0 0 0 / 14%), 0px 6px 32px 5px rgb(0 0 0 / 12%)",
    "elevation-18":
      "0px 9px 11px -5px rgb(0 0 0 / 20%), 0px 18px 28px 2px rgb(0 0 0 / 14%), 0px 7px 34px 6px rgb(0 0 0 / 12%)",
    "elevation-19":
      "0px 9px 12px -6px rgb(0 0 0 / 20%), 0px 19px 29px 2px rgb(0 0 0 / 14%), 0px 7px 36px 6px rgb(0 0 0 / 12%)",
    "elevation-20":
      "0px 10px 13px -6px rgb(0 0 0 / 20%), 0px 20px 31px 3px rgb(0 0 0 / 14%), 0px 8px 38px 7px rgb(0 0 0 / 12%)",
    "elevation-21":
      "0px 10px 13px -6px rgb(0 0 0 / 20%), 0px 21px 33px 3px rgb(0 0 0 / 14%), 0px 8px 40px 7px rgb(0 0 0 / 12%)",
    "elevation-22":
      "0px 10px 14px -6px rgb(0 0 0 / 20%), 0px 22px 35px 3px rgb(0 0 0 / 14%), 0px 8px 42px 7px rgb(0 0 0 / 12%)",
    "elevation-23":
      "0px 11px 14px -7px rgb(0 0 0 / 20%), 0px 23px 36px 3px rgb(0 0 0 / 14%), 0px 9px 44px 8px rgb(0 0 0 / 12%)",
    "elevation-24":
      "0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%)",
    // Motion — easing
    "easing-standard": "cubic-bezier(0.4, 0.0, 0.2, 1)",
    "easing-decelerate": "cubic-bezier(0.0, 0.0, 0.2, 1)",
    "easing-accelerate": "cubic-bezier(0.4, 0.0, 1, 1)",
    "easing-sharp": "cubic-bezier(0.4, 0.0, 0.6, 1)",
    // Motion — duration
    "duration-shortest": "150ms",
    "duration-shorter": "200ms",
    "duration-short": "250ms",
    "duration-standard": "300ms",
    "duration-complex": "375ms",
    "duration-entering": "225ms",
    "duration-leaving": "195ms",
  },
  system: {
    light: {
      primary: "violet-500",
      "primary-variant": "violet-700",
      "on-primary": "neutral-50",
      secondary: "teal-500",
      "secondary-variant": "teal-700",
      "on-secondary": "neutral-50",
      background: "neutral-50",
      "on-background": "neutral-900",
      surface: "neutral-50",
      "on-surface": "neutral-900",
      error: "red-500",
      "on-error": "neutral-50",
    },
    dark: {
      primary: "violet-200",
      "primary-variant": "violet-700",
      "on-primary": "neutral-900",
      secondary: "teal-200",
      "secondary-variant": "teal-200",
      "on-secondary": "neutral-900",
      background: "neutral-900",
      "on-background": "neutral-50",
      surface: "neutral-900",
      "on-surface": "neutral-50",
      error: "red-200",
      "on-error": "neutral-900",
    },
  },
  roles: {},
});

export default preset;
