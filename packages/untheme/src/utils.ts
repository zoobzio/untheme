import { useTokenCSSVars } from "./css";
import type {
  UnthemeConfig,
  UnthemeTokens,
} from "./types";

export function defineUnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
  RoleToken extends string,
>(
  config: UnthemeConfig<RefToken, SysToken, Theme, RoleToken>,
) {
  return config;
}

export function defineUntheme<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
  RoleToken extends string,
>(
  config: UnthemeConfig<RefToken, SysToken, Theme, RoleToken>,
) {
  return (theme: Theme) => {
    const useTokens: () => UnthemeTokens<RefToken, SysToken, RoleToken> = () => ({
      ...config.tokens, 
      ...config.themes[theme], 
      ...config.roles
    });
  
    type Token = keyof ReturnType<typeof useTokens>;
  
    const listTokens = (match?: RegExp) => (Object.keys(useTokens()) as Token[]).filter(tkn => !match || match.test(tkn));
  
    const resolveToken: (token: Token) => string = (token: Token) => {
      let tokens = useTokens();
      return tokens[token] in tokens ? resolveToken(tokens[token]) : tokens[token];
    }
  
    const editToken: <T extends Token>(token: T, value: T extends RefToken ? string : (T extends SysToken ? RefToken : RefToken | SysToken)) => string = (token, value) => {
      if (token in config.tokens) {
        config.tokens = {
          ...config.tokens,
          [token]: value,
        }
      } else if (token in config.themes[theme]) {
        config.themes[theme] = {
          ...config.themes[theme],
          [token]: value,
        }
      } else if (token in config.roles) {
        config.roles = {
          ...config.roles,
          [token]: value,
        }
      }
      return resolveToken(token);
    }
  
    const listThemes = () => Object.keys(config.themes) as Theme[];
  
    const useVars = (match?: RegExp) => useTokenCSSVars(listTokens(match));

    return {
      useTokens,
      listTokens,
      resolveToken,
      editToken,
      listThemes,
      useVars,
    }
  }
}