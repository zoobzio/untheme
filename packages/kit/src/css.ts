import kebabCase from "lodash.kebabcase";

export function useCSSVarKey(prefix: string, key: string) {
  return `--${prefix}-${kebabCase(key)}`;
}

export function useCSSVar(prefix: string, key: string) {
  return `var(${useCSSVarKey(prefix, key)})`;
}

export function useTokenVars<Token extends string>(
  tokens: Token[],
  prefix: string = "ut",
): Record<Token, string> {
  return tokens.reduce(
    (x, y) => {
      x[y] = useCSSVar(prefix, y);
      return x;
    },
    {} as Record<Token, string>,
  );
}

export function useRoot(
  tokens: Record<string, string>,
  prefix: string = "ut",
): string {
  const keys = Object.keys(tokens);
  const vars = keys.reduce((x, y) => {
    const v = useCSSVarKey(prefix, y);
    const d = tokens[y] in tokens ? useCSSVar(prefix, tokens[y]) : tokens[y];
    x.push(`${v}: ${d};`);
    return x;
  }, [] as string[]);
  return `:root {\n${vars.join("\n")}\n}`;
}
