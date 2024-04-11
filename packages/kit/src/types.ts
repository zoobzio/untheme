export type Merge<T extends string, S extends string> = T extends ""
  ? T
  : `${S}${T}`;

export type Tokenize<S extends string, T extends string[]> = T extends [
  infer F extends string,
  ...infer R extends string[],
]
  ? `${F}${Merge<Tokenize<S, R>, S>}`
  : "";
