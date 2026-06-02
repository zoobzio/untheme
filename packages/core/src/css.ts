import { Config } from "./types";

/**
 * Generates a CSS string of custom properties from a {@link Config}.
 *
 * Produces `:root` blocks for reference tokens and light/dark mode system tokens.
 * Additional tokens can be passed via the `addon` parameter.
 * Values that reference other tokens are wrapped in `var()`.
 *
 * @param theme - The config to generate CSS from.
 * @param addon - Optional additional token entries to include (e.g. role tokens).
 * @returns A CSS string containing custom property declarations.
 */
export const generateCSS = (
  theme: Config<string, string>,
  addon: Record<string, string> = {},
) => {
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
    Object.entries(addon),
  ]
    .filter((entries) => entries.length > 0)
    .forEach(write);

  return lines.join("\n");
};
