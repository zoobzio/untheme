/**
 * Generates a CSS string of custom properties from a flat token record.
 *
 * Produces a single `:root` block, one custom property per entry. A value
 * that is itself another token's key is emitted as a `var()` reference to it;
 * any other value is emitted verbatim. An empty record yields an empty string.
 *
 * @param tokens - A flat record of token names to CSS values (aliases held as
 *   the referenced token's key).
 * @returns A `:root` custom-property block, or `""` when `tokens` is empty.
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
