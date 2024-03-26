import { defineUntheme } from "untheme";

export default defineUntheme({
  tokens: {
    green: "#059669",
    blue: "#0284c7",
    red: "#dc2626",
    yellow: "#FFFF00"
  },
  themes: {
    light: {
      primary: "yellow",
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
  mode: "dark"
});
