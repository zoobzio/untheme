import type {
  Untheme,
  UnthemeRefTokens,
  UnthemeTokenUtils,
  UnthemeSysTokens,
  UnthemeThemeUtils,
  UnthemeRoleTokens,
  UnthemeRoleUtils,
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

export function defineRoleUtils<
  RefToken extends string,
  SysToken extends string,
  RoleToken extends string,
>(
  tokens: UnthemeRoleTokens<RefToken, SysToken, RoleToken>
): UnthemeRoleUtils<RefToken, SysToken, RoleToken> {
  return {
    getRoleTokens: () => tokens,
    listRoleTokens: () => Object.keys(tokens) as RoleToken[],
    resolveRoleToken: (token: RoleToken) => tokens[token],
    editRoleToken: (token: RoleToken, value: RefToken | SysToken) =>
      (tokens[token] = value),
  }
}

export const defineUntheme: Untheme = (config) => {
  return (variant) => {
    let theme = config.themes[variant];

    type RefToken = keyof typeof config.tokens;
    type ThemeToken = keyof typeof theme;
    type RoleToken = keyof typeof config.roles;

    const tokenUtils = defineTokenUtils(config.tokens);
    const themeUtils = defineThemeUtils(theme);
    const roleUtils = defineRoleUtils(config.roles);

    function getTokens() {
      return {
        ...tokenUtils.getReferenceTokens(),
        ...themeUtils.getSystemTokens(),
        ...roleUtils.getRoleTokens(),
      };
    }

    function listTokens() {
      return [
        ...tokenUtils.listReferenceTokens(),
        ...themeUtils.listSystemTokens(),
        ...roleUtils.listRoleTokens(),
      ];
    }

    function resolveToken(token: RefToken | ThemeToken | RoleToken): string {
      if (token in config.tokens) {
        return config.tokens[token as RefToken];
      } 
      if (token in theme) {
        return resolveToken(theme[token as ThemeToken]);
      }
      return resolveToken(config.roles[token as RoleToken]);
    }

    return {
      getTokens,
      listTokens,
      resolveToken,
      ...tokenUtils,
      ...themeUtils,
      ...roleUtils,
    };
  };
};
