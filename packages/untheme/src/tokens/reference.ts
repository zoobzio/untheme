import type { UnthemeRefTokens, UnthemeRefUtils } from "../types";

export function defineRefUtils<RefToken extends string>(tokens: UnthemeRefTokens<RefToken>): UnthemeRefUtils<RefToken> {
  const getReferenceTokens = () => tokens;

  const listReferenceTokens = () => Object.keys(tokens) as RefToken[];

  const resolveReferenceToken = (token: RefToken) => tokens[token];

  const editReferenceToken = (token: RefToken, value: string) =>
    (tokens[token] = value);

  return {
    getReferenceTokens,
    listReferenceTokens,
    resolveReferenceToken,
    editReferenceToken,
  };
}
