import { defineUntheme } from "untheme";

export default defineUntheme({
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
