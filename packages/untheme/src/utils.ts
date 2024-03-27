import type { Untheme } from "./types";

export const defineUntheme: Untheme = (config) => (theme) => ({
  ...config.tokens,
  ...config.themes[theme],
  ...config.roles,
});
