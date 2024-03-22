import type {
  Untheme,
  UnthemeRefTokens,
  UnthemeTokenUtils,
  UnthemeSysTokens,
  UnthemeThemeUtils,
} from "./types";

export function defineTokenUtils<RefToken extends string>(
  tokens: UnthemeRefTokens<RefToken>,
): UnthemeTokenUtils<RefToken> {
  return {
    getReferenceTokens: () => tokens,
    listReferenceTokens: () => Object.keys(tokens) as RefToken[],
    resolveReferenceToken: (token: RefToken) => tokens[token],
    editReferenceToken: (token: RefToken, value: string) =>
      (tokens[token] = value),
  };
}

export function defineThemeUtils<
  RefToken extends string,
  SysToken extends string,
>(
  tokens: UnthemeSysTokens<RefToken, SysToken>,
): UnthemeThemeUtils<RefToken, SysToken> {
  return {
    getSystemTokens: () => tokens,
    listSystemTokens: () => Object.keys(tokens) as SysToken[],
    resolveSystemToken: (token: SysToken) => tokens[token],
    editSystemToken: (token: SysToken, value: RefToken) =>
      (tokens[token] = value),
  };
}

export const defineUntheme: Untheme = (config) => {
  return (variant) => {
    let theme = config.themes[variant];

    type Token = keyof typeof config.tokens;
    type ThemeToken = keyof typeof theme;

    const tokenUtils = defineTokenUtils(config.tokens);
    const themeUtils = defineThemeUtils(theme);

    function getTokens() {
      return {
        ...tokenUtils.getReferenceTokens(),
        ...themeUtils.getSystemTokens(),
      };
    }

    function listTokens() {
      return [
        ...tokenUtils.listReferenceTokens(),
        ...themeUtils.listSystemTokens(),
      ];
    }

    function resolveToken(token: Token | ThemeToken): string {
      return token in config.tokens
        ? config.tokens[token as Token]
        : resolveToken(theme[token as ThemeToken]);
    }

    function editToken<T>(
      token: T extends Token ? Token : ThemeToken,
      value: T extends Token ? string : Token,
    ): string {
      token in config.tokens
        ? (config.tokens[token as Token] = value)
        : (theme[token as ThemeToken] = value as Token);
      return resolveToken(token);
    }

    return {
      getTokens,
      listTokens,
      resolveToken,
      editToken,
      ...tokenUtils,
      ...themeUtils,
    };
  };
};
