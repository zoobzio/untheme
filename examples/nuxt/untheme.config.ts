import { defineUntheme } from "untheme";

export const { useUntheme, useTokenVars } = defineUntheme({
  tokens: {
    green: "#059669",
    blue: "#0284c7",
    red: "#dc2626",
  },
  themes: {
    light: {
      primary: "green",
      error: "red",
    },
    dark: {
      primary: "blue",
      error: "green",
    },
  },
  roles: {
    onPrimary: "primary",
    belowPrimary: "error",
  },
});
