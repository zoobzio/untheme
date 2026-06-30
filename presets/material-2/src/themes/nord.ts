import preset from "../preset";
import { createM2ColorTokens } from "../colors";

/**
 * Nord theme — M2 token variant.
 */
export default preset.define({
  id: "nord",
  name: "Nord",
  tokens: {
    ...createM2ColorTokens("red", "#bf616a"),
    ...createM2ColorTokens("orange", "#d08770"),
    ...createM2ColorTokens("amber", "#d08770"),
    ...createM2ColorTokens("yellow", "#ebcb8b"),
    ...createM2ColorTokens("lime", "#a3be8c"),
    ...createM2ColorTokens("green", "#a3be8c"),
    ...createM2ColorTokens("emerald", "#a3be8c"),
    ...createM2ColorTokens("teal", "#8fbcbb"),
    ...createM2ColorTokens("cyan", "#88c0d0"),
    ...createM2ColorTokens("sky", "#88c0d0"),
    ...createM2ColorTokens("blue", "#5e81ac"),
    ...createM2ColorTokens("indigo", "#81a1c1"),
    ...createM2ColorTokens("violet", "#b48ead"),
    ...createM2ColorTokens("purple", "#b48ead"),
    ...createM2ColorTokens("fuchsia", "#b48ead"),
    ...createM2ColorTokens("pink", "#bf616a"),
    ...createM2ColorTokens("rose", "#bf616a"),
    ...createM2ColorTokens("slate", "#434c5e"),
    ...createM2ColorTokens("gray", "#4c566a"),
    ...createM2ColorTokens("zinc", "#4c566a"),
    ...createM2ColorTokens("neutral", "#2e3440"),
    ...createM2ColorTokens("stone", "#3b4252"),
    // Semantic roles — default to the light scheme
    primary: "{cyan-500}",
    "primary-variant": "{cyan-700}",
    "on-primary": "{neutral-50}",
    secondary: "{teal-500}",
    "secondary-variant": "{teal-700}",
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
        primary: "{cyan-200}",
        "primary-variant": "{cyan-700}",
        "on-primary": "{neutral-900}",
        secondary: "{teal-200}",
        "secondary-variant": "{teal-200}",
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
