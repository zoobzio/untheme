import { defineRefUtils } from "./tokens/reference";
import { defineSysUtils } from "./tokens/system";
import type { Untheme, UnthemeConfig, UnthemeTokens } from "./types";

export function defineUnthemeConfig<RefToken extends string, SysToken extends string>(config: UnthemeConfig<RefToken, SysToken>) {
  return config;
}

export const defineUntheme: Untheme = ({ refTokens, sysTokens }) => {
  let tokens: UnthemeTokens<keyof typeof refTokens, keyof typeof sysTokens> = {
    ...refTokens,
    ...sysTokens,
  };

  const getTokens = () => tokens;

  const listTokens = () => Object.keys(tokens) as (keyof typeof tokens)[];

  const resolveToken: (token: keyof typeof tokens) => string = (token) => {
    const result = tokens[token];
    return result in tokens ? resolveToken(result) : result;
  };

  const refUtils = defineRefUtils<keyof typeof refTokens>(tokens);
  const sysUtils = defineSysUtils<keyof typeof refTokens, keyof typeof sysTokens>(tokens);

  return {
    getTokens,
    listTokens,
    resolveToken,
    ...refUtils,
    ...sysUtils 
  };
};
