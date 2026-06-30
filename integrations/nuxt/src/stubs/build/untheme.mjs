export const theme = {
  id: "alpha",
  name: "Alpha",
  tokens: {
    white: "#ffffff",
    black: "#000000",
    blue: "#3b82f6",
    indigo: "#6366f1",
    surface: "{white}",
    "on-surface": "{black}",
    primary: "{blue}",
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

export const themes = {
  alpha: theme,
  bravo: {
    id: "bravo",
    name: "Bravo",
    tokens: {
      white: "#fafafa",
      black: "#111111",
      blue: "#2563eb",
      indigo: "#4f46e5",
      surface: "{white}",
      "on-surface": "{black}",
      primary: "{blue}",
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
  },
};

export const input = { color: "light" };
