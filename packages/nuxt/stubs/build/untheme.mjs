/** @type {string} */
export const key = "default";

/** @type {import("untheme").ThemeTemplate} */
export const theme = {
  label: "Default",
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

/** @type {Array<{ key: string; label: string }>} */
export const themes = [{ key: "default", label: "Default" }];

/** @type {{ reference: readonly string[]; system: readonly string[]; role: readonly string[] }} */
export const tokens = {
  reference: ["white", "black", "slate", "blue", "indigo", "red", "green", "amber"],
  system: ["primary", "secondary", "neutral", "surface", "on_surface", "error", "success", "warning"],
  role: ["text-color", "text-muted", "background-color", "border-color", "link-color", "link-hover", "button-bg", "button-text", "error-text", "success-text", "warning-text"],
};
