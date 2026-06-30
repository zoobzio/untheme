import preset from "../preset";
import { createM2ColorTokens } from "../colors";

/**
 * Night Owl theme — M2 token variant.
 */
export default preset.define({
  id: "night_owl",
  name: "Night Owl",
  tokens: {
    ...createM2ColorTokens("red", "#ff5874"),
    ...createM2ColorTokens("orange", "#F78C6C"),
    ...createM2ColorTokens("amber", "#ffcb8b"),
    ...createM2ColorTokens("yellow", "#ecc48d"),
    ...createM2ColorTokens("lime", "#c5e478"),
    ...createM2ColorTokens("green", "#c5e478"),
    ...createM2ColorTokens("emerald", "#7fdbca"),
    ...createM2ColorTokens("teal", "#7fdbca"),
    ...createM2ColorTokens("cyan", "#5ca7e4"),
    ...createM2ColorTokens("sky", "#82AAFF"),
    ...createM2ColorTokens("blue", "#82AAFF"),
    ...createM2ColorTokens("indigo", "#4373c2"),
    ...createM2ColorTokens("violet", "#c792ea"),
    ...createM2ColorTokens("purple", "#7e57c2"),
    ...createM2ColorTokens("fuchsia", "#c792ea"),
    ...createM2ColorTokens("pink", "#ff5874"),
    ...createM2ColorTokens("rose", "#ff5874"),
    ...createM2ColorTokens("slate", "#4b6479"),
    ...createM2ColorTokens("gray", "#637777"),
    ...createM2ColorTokens("zinc", "#1d3b53"),
    ...createM2ColorTokens("neutral", "#011627"),
    ...createM2ColorTokens("stone", "#5f7e97"),
    // Semantic roles — default to the light scheme
    primary: "{blue-500}",
    "primary-variant": "{blue-700}",
    "on-primary": "{neutral-50}",
    secondary: "{violet-500}",
    "secondary-variant": "{violet-700}",
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
        primary: "{blue-200}",
        "primary-variant": "{blue-700}",
        "on-primary": "{neutral-900}",
        secondary: "{violet-200}",
        "secondary-variant": "{violet-200}",
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
