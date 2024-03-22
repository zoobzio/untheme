import { defineUnthemeConfig } from "untheme";

export default defineUnthemeConfig({
  tokens: {
    green: "#green",
    blue: "#blue",
    red: "#red",
  },
  themes: {
    light: {
      primary: "green",
      error: "red",
    },
    dark: {
      primary: "blue",
      error: "red",
    },
  },
});
