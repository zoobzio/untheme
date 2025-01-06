// separator is `-` to maintain css var convention
const separator = "-" as const;

export type UnthemeMergeTokenChunks<
  T extends string,
  S extends string,
> = T extends "" ? T : `${S}${T}`;

export type UnthemeTokenize<S extends string, T extends string[]> = T extends [
  infer F extends string,
  ...infer R extends string[],
]
  ? `${F}${UnthemeMergeTokenChunks<UnthemeTokenize<S, R>, S>}`
  : "";

export function useUnthemeTokenize<C extends string[]>(...chunks: C) {
  return chunks.join(separator) as UnthemeTokenize<typeof separator, C>;
}

// TODO define a more perscriptive type to allow only valid CSS values
export type UnthemeTokenValue = string;

export type UnthemeTokenPack<Token extends string> = {
  [T in Token]: UnthemeTokenValue;
};

export function defineUnthemeTokens<
  Prefix extends string,
  Token extends string,
>(prefix: Prefix, pack: UnthemeTokenPack<Token>) {
  const keys = Object.keys(pack) as Token[];
  const tokens = keys.map((k) => useUnthemeTokenize(prefix, k));
  return tokens.reduce(
    (x, y, i) => {
      x[y] = pack[keys[i]];
      return x;
    },
    {} as Record<(typeof tokens)[number], string>,
  );
}

export function mergeUnthemeTokenPack<Token extends string>(
  pack: UnthemeTokenPack<Token>,
  override: Partial<UnthemeTokenPack<Token>>,
) {
  const tokens = { ...pack };
  (Object.keys(override) as Token[]).forEach((key) => {
    if (key in tokens && override[key]) {
      tokens[key] = override[key];
    }
  });
  return tokens;
}

export function defineUnthemeTokenPack<
  Prefix extends string,
  Token extends string,
>(prefix: Prefix, pack: UnthemeTokenPack<Token>) {
  return (override: Partial<UnthemeTokenPack<Token>> = {}) =>
    defineUnthemeTokens(prefix, mergeUnthemeTokenPack(pack, override));
}
