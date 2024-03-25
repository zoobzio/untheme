import kebabCase from "lodash.kebabcase";

export function useCSSVarKey(prefix: string, key: string) {
  return `--${prefix}-${kebabCase(key)}`;
}

export function useCSSVar(key: string) {
  return `var(${key})`;
}

export function useRootCSSVars(
  tokens: Record<string, string>,
  prefix: string = "ut",
): string {
  const keys = Object.keys(tokens);
  const vars = keys.reduce((x, y) => {
    const v = useCSSVarKey(prefix, y);
    const d =
      tokens[y] in tokens
        ? useCSSVar(useCSSVarKey(prefix, tokens[y]))
        : tokens[y];
    x.push(`${v}: ${d};`);
    return x;
  }, [] as string[]);
  return `:root {\n${vars.join("\n")}\n}`;
}

export function useTokenCSSVars<Token extends string>(
  tokens: Token[],
  prefix: string = "ut",
): Record<Token, string> {
  return tokens.reduce(
    (x, y) => {
      x[y] = useCSSVar(useCSSVarKey(prefix, y));
      return x;
    },
    {} as Record<Token, string>,
  );
}
