import { ThemeTemplate } from "./types";

/**
 * Generates a CSS string of custom properties from a {@link ThemeTemplate}.
 *
 * Produces `:root` blocks for reference tokens, light/dark mode system tokens,
 * and role tokens. Values that reference other tokens are wrapped in `var()`.
 *
 * @param theme - The theme template to generate CSS from.
 * @returns A CSS string containing custom property declarations.
 */
export const generateCSS = (theme: ThemeTemplate) => {
  const lines: string[] = [];

  const tokenKeys = new Set([
    ...Object.keys(theme.reference),
    ...Object.keys(theme.modes.light),
    ...Object.keys(theme.modes.dark),
  ]);

  const check = (value: string): boolean => tokenKeys.has(value);

  const wrap = (value: string): string =>
    check(value) ? `var(--${value})` : value;

  const write = (entries: [k: string, v: string][]) =>
    lines.push(
      ...[
        ":root {",
        ...entries.map(([key, value]) => ` --${key}: ${wrap(value)};`),
        "}",
      ],
    );

  [
    Object.entries(theme.reference),
    Object.entries(theme.modes.light),
    Object.entries(theme.modes.dark),
    Object.entries(theme.roles),
  ].forEach(write);

  return lines.join("\n");
};
