/**
 * Generates a CSS string of custom properties from a flat token record.
 *
 * Produces a single `:root` block, one custom property per entry. A value in
 * `{token}` reference form is emitted as a `var(--token)` indirection to that
 * token; any other value is emitted verbatim. An empty record yields an empty
 * string.
 *
 * @param tokens - A flat record of token names to CSS values, where a reference
 *   to another token is held in `{token}` curly-brace form.
 * @returns A `:root` custom-property block, or `""` when `tokens` is empty.
 */
export const generateRootCSS = (
  tokens: Record<string, `{${string}}` | string>,
) => {
  const wrap = (value: string): string => {
    const reference = /^\{(.+)\}$/.exec(value);
    if (reference) {
      return `var(--${reference[1]})`;
    }
    return value;
  };

  const entries = Object.entries(tokens);
  if (entries.length === 0) return "";

  return [
    ":root {",
    ...entries.map(([key, value]) => ` --${key}: ${wrap(value)};`),
    "}",
  ].join("\n");
};
