import preset from "../preset";
import { createM2ColorTokens } from "../colors";

/**
 * Rose Pine theme — M2 token variant.
 */
export default preset.define({
  id: "rose_pine",
  name: "Rose Pine",
  tokens: {
    ...createM2ColorTokens("red", "#eb6f92"),
    ...createM2ColorTokens("orange", "#f6c177"),
    ...createM2ColorTokens("amber", "#f6c177"),
    ...createM2ColorTokens("yellow", "#f6c177"),
    ...createM2ColorTokens("lime", "#9ccfd8"),
    ...createM2ColorTokens("green", "#9ccfd8"),
    ...createM2ColorTokens("emerald", "#31748f"),
    ...createM2ColorTokens("teal", "#31748f"),
    ...createM2ColorTokens("cyan", "#9ccfd8"),
    ...createM2ColorTokens("sky", "#9ccfd8"),
    ...createM2ColorTokens("blue", "#31748f"),
    ...createM2ColorTokens("indigo", "#31748f"),
    ...createM2ColorTokens("violet", "#c4a7e7"),
    ...createM2ColorTokens("purple", "#c4a7e7"),
    ...createM2ColorTokens("fuchsia", "#eb6f92"),
    ...createM2ColorTokens("pink", "#ebbcba"),
    ...createM2ColorTokens("rose", "#ebbcba"),
    ...createM2ColorTokens("slate", "#524f67"),
    ...createM2ColorTokens("gray", "#6e6a86"),
    ...createM2ColorTokens("zinc", "#403d52"),
    ...createM2ColorTokens("neutral", "#191724"),
    ...createM2ColorTokens("stone", "#908caa"),
    // Semantic roles — default to the light scheme
    primary: "{violet-500}",
    "primary-variant": "{violet-700}",
    "on-primary": "{neutral-50}",
    secondary: "{cyan-500}",
    "secondary-variant": "{cyan-700}",
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
        secondary: "{cyan-200}",
        "secondary-variant": "{cyan-200}",
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
