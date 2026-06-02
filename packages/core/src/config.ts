import type { ThemeTemplate, Theme } from "./types";

/**
 * Creates a theme factory function from a base {@link ThemeTemplate}.
 *
 * @param base - The base theme template that defines the token structure.
 * @returns A function that accepts partial theme overrides and returns a fully resolved {@link Theme}.
 */
export const defineThemeConfig =
  <const T extends ThemeTemplate>(base: T) =>
  (theme: Partial<Theme<T>>): Theme<T> => {
    return {
      ...base,
      ...theme,
    };
  };
