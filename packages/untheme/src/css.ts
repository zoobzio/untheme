/**
 * Generates a CSS string of custom properties from a flat token record.
 *
 * Produces a single `:root` block. Values that reference other token keys
 * are wrapped in `var()`.
 *
 * @param tokens - A record of token names to CSS values.
 * @returns A CSS string containing custom property declarations.
 */
export const generateCSS = (tokens: Record<string, string>) => {
  const check = (value: string): boolean => value in tokens;

  const wrap = (value: string): string =>
    check(value) ? `var(--${value})` : value;

  const entries = Object.entries(tokens);
  if (entries.length === 0) return "";

  return [
    ":root {",
    ...entries.map(([key, value]) => ` --${key}: ${wrap(value)};`),
    "}",
  ].join("\n");
};
