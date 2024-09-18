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
