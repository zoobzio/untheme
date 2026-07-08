// Runtime stub for the generated `#build/untheme.mjs` virtual module.
export const theme = {
  id: "alpha",
  name: "Alpha",
  tokens: {
    white: {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
    },
    black: {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
    },
    blue: {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.23, 0.51, 0.96],
        hex: "#3b82f6",
      },
    },
    indigo: {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.39, 0.4, 0.95],
        hex: "#6366f1",
      },
    },
    surface: { $type: "color", $value: "{white}" },
    "on-surface": { $type: "color", $value: "{black}" },
    primary: { $type: "color", $value: "{blue}" },
  },
  modifiers: {
    color: {
      light: {},
      dark: {
        surface: "{black}",
        "on-surface": "{white}",
        primary: "{indigo}",
      },
    },
  },
  order: ["color"],
};

// The switchable catalog holds layers: identity plus what diverges from the
// baseline. Alpha is the baseline itself, so it carries no overrides; bravo
// rebinds the literal colors and carries a modifier override — its dark
// context keeps primary on blue where the baseline flips to indigo — while
// everything unstated resolves from the baseline.
export const themes = {
  alpha: { id: "alpha", name: "Alpha" },
  bravo: {
    id: "bravo",
    name: "Bravo",
    tokens: {
      white: {
        colorSpace: "srgb",
        components: [0.98, 0.98, 0.98],
        hex: "#fafafa",
      },
      black: {
        colorSpace: "srgb",
        components: [0.07, 0.07, 0.07],
        hex: "#111111",
      },
      blue: {
        colorSpace: "srgb",
        components: [0.15, 0.39, 0.92],
        hex: "#2563eb",
      },
      indigo: {
        colorSpace: "srgb",
        components: [0.31, 0.27, 0.9],
        hex: "#4f46e5",
      },
    },
    modifiers: {
      color: {
        dark: {
          primary: "{blue}",
        },
      },
    },
  },
};

export const input = { color: "light" };
