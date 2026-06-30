import preset from "../preset";
import { createM2ColorTokens } from "../colors";

/**
 * GitHub theme — M2 token variant.
 */
export default preset.define({
  id: "github",
  name: "GitHub",
  tokens: {
    ...createM2ColorTokens("red", "#cf222e"),
    ...createM2ColorTokens("orange", "#953800"),
    ...createM2ColorTokens("amber", "#9a6700"),
    ...createM2ColorTokens("yellow", "#9a6700"),
    ...createM2ColorTokens("lime", "#116329"),
    ...createM2ColorTokens("green", "#116329"),
    ...createM2ColorTokens("emerald", "#1b7c83"),
    ...createM2ColorTokens("teal", "#1b7c83"),
    ...createM2ColorTokens("cyan", "#1b7c83"),
    ...createM2ColorTokens("sky", "#0969da"),
    ...createM2ColorTokens("blue", "#0969da"),
    ...createM2ColorTokens("indigo", "#0550ae"),
    ...createM2ColorTokens("violet", "#8250df"),
    ...createM2ColorTokens("purple", "#8250df"),
    ...createM2ColorTokens("fuchsia", "#bf3989"),
    ...createM2ColorTokens("pink", "#bf3989"),
    ...createM2ColorTokens("rose", "#cf222e"),
    ...createM2ColorTokens("slate", "#6e7781"),
    ...createM2ColorTokens("gray", "#59636e"),
    ...createM2ColorTokens("zinc", "#454c54"),
    ...createM2ColorTokens("neutral", "#0d1117"),
    ...createM2ColorTokens("stone", "#818b98"),
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
