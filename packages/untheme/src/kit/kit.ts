// separator is `-` to maintain css var convention
const separator = "-" as const;

type _MergeTokenChunks<T extends string, S extends string> = T extends ""
  ? T
  : `${S}${T}`;

export type Tokenize<S extends string, T extends string[]> = T extends [
  infer F extends string,
  ...infer R extends string[],
]
  ? `${F}${_MergeTokenChunks<Tokenize<S, R>, S>}`
  : "";

export function useTokenize<C extends string[]>(...chunks: C) {
  return chunks.join(separator) as Tokenize<typeof separator, C>;
}

export function useCSSVarKey(key: string) {
  return `--${key.replace(/([a-zA-Z])(?=[A-Z])/g, "$1_").toLowerCase()}`;
}

export function useCSSVar(key: string) {
  return `var(${useCSSVarKey(key)})`;
}

export function useTokenVars<Token extends string>(
  tokens: Token[],
): Record<Token, string> {
  return tokens.reduce(
    (x, y) => {
      x[y] = useCSSVar(y);
      return x;
    },
    {} as Record<Token, string>,
  );
}

export function useRoot(tokens: Record<string, string>): string {
  const keys = Object.keys(tokens);
  const vars = keys.reduce((x, y) => {
    const v = useCSSVarKey(y);
    const d = tokens[y] in tokens ? useCSSVar(tokens[y]) : tokens[y];
    x.push(`${v}: ${d};`);
    return x;
  }, [] as string[]);
  return `:root {\n${vars.join("\n")}\n}`;
}
