export function useUnthemeCSSVarKey(key: string) {
  return `--${key.replace(/([a-zA-Z])(?=[A-Z])/g, "$1_").toLowerCase()}`;
}

export function useUnthemeCSSVar(key: string) {
  return `var(${useUnthemeCSSVarKey(key)})`;
}

export function useUnthemeTokenCSSVars<Token extends string>(
  tokens: Token[],
): Record<Token, string> {
  return tokens.reduce(
    (x, y) => {
      x[y] = useUnthemeCSSVar(y);
      return x;
    },
    {} as Record<Token, string>,
  );
}

export function useUnthemeCSSRoot(
  tokens: Record<string, string>,
  whitelist: string[] = [],
): string {
  const keys = whitelist.length > 0 ? whitelist : Object.keys(tokens);
  if (keys.some((k) => !(k in tokens))) {
    throw new Error("Invalid token!", {
      cause: keys,
    });
  }

  const resolve = (token: string): string =>
    tokens[token] in tokens ? resolve(tokens[token]) : tokens[token];

  const vars = keys.reduce((x, y) => {
    x.push(`  ${useUnthemeCSSVarKey(y)}: ${resolve(y)};`);
    return x;
  }, [] as string[]);

  return [":root {", ...vars, "}"].join("\n");
}
