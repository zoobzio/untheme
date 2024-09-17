import type { Tokenize } from "../types";

export function useTokenize<X extends string, C extends string[]>(
  separator: X,
  ...chunks: C
) {
  return chunks.join(separator) as Tokenize<X, C>;
}
