export const theme = {
  preset: "m3",
  key: "alpha",
  label: "Alpha",
  reference: {
    white: "#ffffff",
    black: "#000000",
    slate: "#64748b",
    blue: "#3b82f6",
    indigo: "#6366f1",
    red: "#ef4444",
    green: "#22c55e",
    amber: "#f59e0b",
  },
  modes: {
    light: {
      primary: "blue",
      secondary: "indigo",
      neutral: "slate",
      surface: "white",
      on_surface: "black",
      error: "red",
      success: "green",
      warning: "amber",
    },
    dark: {
      primary: "indigo",
      secondary: "blue",
      neutral: "slate",
      surface: "black",
      on_surface: "white",
      error: "red",
      success: "green",
      warning: "amber",
    },
  },
  roles: {
    "text-color": "on_surface",
    "text-muted": "neutral",
    "background-color": "surface",
    "border-color": "neutral",
    "link-color": "primary",
    "link-hover": "secondary",
    "button-bg": "primary",
    "button-text": "surface",
    "error-text": "error",
    "success-text": "success",
    "warning-text": "warning",
  },
};

export const extend = {
  reference: {
    amber: "#f39e0b",
  },
  modes: {
    light: {
      warning: "amber",
    },
    dark: {
      warning: "amber",
    },
  },
  roles: {
    "text-color": "on_surface",
    "text-muted": "neutral",
    "background-color": "surface",
    "border-color": "neutral",
    "link-color": "primary",
    "link-hover": "secondary",
    "button-bg": "primary",
    "button-text": "surface",
    "error-text": "error",
    "success-text": "success",
    "warning-text": "warning",
  },
};

export const options = [
  { key: "alpha", label: "Alpha" },
  { key: "bravo", label: "Bravo" },
];

export const ref = Object.keys(theme.reference);

export const sys = Object.keys(theme.modes.dark);

export const role = Object.keys(theme.roles);
