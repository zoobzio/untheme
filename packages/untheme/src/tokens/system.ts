import type { UnthemeSysTokens, UnthemeSysUtils } from "../types";

export function defineSysUtils<
  RefToken extends string,
  SysToken extends string, 
>(tokens: UnthemeSysTokens<RefToken, SysToken>): UnthemeSysUtils<RefToken, SysToken> {
  const getSystemTokens = () => tokens;

  const listSystemTokens = () => Object.keys(tokens) as SysToken[];

  const resolveSystemToken = (token: SysToken) => tokens[token];

  const editSystemToken = (token: SysToken, value: RefToken) =>
    (tokens[token] = value);

  return {
    getSystemTokens,
    listSystemTokens,
    resolveSystemToken,
    editSystemToken,
  };
}