import preset from "../preset";
import { createM2ColorTokens } from "../colors";

/**
 * Catppuccin theme — M2 token variant.
 */
export default preset.define({
  id: "catppuccin",
  name: "Catppuccin",
  tokens: {
    ...createM2ColorTokens("red", "#f38ba8"),
    ...createM2ColorTokens("orange", "#fab387"),
    ...createM2ColorTokens("amber", "#fab387"),
    ...createM2ColorTokens("yellow", "#f9e2af"),
    ...createM2ColorTokens("lime", "#a6e3a1"),
    ...createM2ColorTokens("green", "#a6e3a1"),
    ...createM2ColorTokens("emerald", "#94e2d5"),
    ...createM2ColorTokens("teal", "#94e2d5"),
    ...createM2ColorTokens("cyan", "#89dceb"),
    ...createM2ColorTokens("sky", "#89dceb"),
    ...createM2ColorTokens("blue", "#89b4fa"),
    ...createM2ColorTokens("indigo", "#74c7ec"),
    ...createM2ColorTokens("violet", "#cba6f7"),
    ...createM2ColorTokens("purple", "#b4befe"),
    ...createM2ColorTokens("fuchsia", "#f5c2e7"),
    ...createM2ColorTokens("pink", "#f2cdcd"),
    ...createM2ColorTokens("rose", "#eba0ac"),
    ...createM2ColorTokens("slate", "#585b70"),
    ...createM2ColorTokens("gray", "#6c7086"),
    ...createM2ColorTokens("zinc", "#7f849c"),
    ...createM2ColorTokens("neutral", "#1e1e2e"),
    ...createM2ColorTokens("stone", "#9399b2"),
    // Semantic roles — default to the light scheme
    primary: "{violet-500}",
    "primary-variant": "{violet-700}",
    "on-primary": "{neutral-50}",
    secondary: "{blue-500}",
    "secondary-variant": "{blue-700}",
    "on-secondary": "{neutral-50}",
    background: "{neutral-50}",
    "on-background": "{neutral-900}",
    surface: "{neutral-50}",
    "on-surface": "{neutral-900}",
    error: "{red-500}",
    "on-error": "{neutral-50}",
  },
  modifiers: {
    color: {
      light: {},
      dark: {
        primary: "{violet-200}",
        "primary-variant": "{violet-700}",
        "on-primary": "{neutral-900}",
        secondary: "{blue-200}",
        "secondary-variant": "{blue-200}",
        "on-secondary": "{neutral-900}",
        background: "{neutral-900}",
        "on-background": "{neutral-50}",
        surface: "{neutral-900}",
        "on-surface": "{neutral-50}",
        error: "{red-200}",
        "on-error": "{neutral-900}",
      },
    },
  },
  order: ["color"],
});
