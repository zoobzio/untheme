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

export const input = { color: "light" };
