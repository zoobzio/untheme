export const theme = {
  id: "alpha",
  name: "Alpha",
  reference: {
    white: "#ffffff",
    black: "#000000",
    slate: "#64748b",
    blue: "#3b82f6",
    indigo: "#6366f1",
  },
  system: {
    light: {
      primary: "blue",
      surface: "white",
      "on-surface": "black",
      muted: "slate",
    },
    dark: {
      primary: "indigo",
      surface: "black",
      "on-surface": "white",
      muted: "slate",
    },
  },
  roles: {
    "text-color": "on-surface",
    "background-color": "surface",
    "link-color": "primary",
  },
};

export const themes = {
  alpha: theme,
  bravo: {
    id: "bravo",
    name: "Bravo",
    reference: {
      white: "#fafafa",
      black: "#111111",
      slate: "#475569",
      blue: "#2563eb",
      indigo: "#4f46e5",
    },
    system: {
      light: {
        primary: "blue",
        surface: "white",
        "on-surface": "black",
        muted: "slate",
      },
      dark: {
        primary: "indigo",
        surface: "black",
        "on-surface": "white",
        muted: "slate",
      },
    },
    roles: {
      "text-color": "on-surface",
      "background-color": "surface",
      "link-color": "primary",
    },
  },
};
