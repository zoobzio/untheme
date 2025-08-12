import type {
  UnthemeColorMode,
  UnthemeConfig,
  UnthemeTokenUtil,
  UnthemeSysTokens,
} from "./types";

export function defineUnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  ModeToken extends string,
  RoleToken extends string,
>(config: UnthemeConfig<RefToken, SysToken, ModeToken, RoleToken>) {
  return config;
}

export function defineUntheme<
  RefToken extends string,
  SysToken extends string,
  ModeToken extends string,
  RoleToken extends string,
>(config: UnthemeConfig<RefToken, SysToken, ModeToken, RoleToken>) {
  let currentTheme = config.theme;
  const use: UnthemeTokenUtil<RefToken, SysToken, ModeToken, RoleToken> = (
    mode,
  ) => ({
    ...config.tokens,
    ...currentTheme,
    ...config.modes[mode],
    ...config.roles,
  });

  const resolve = (
    token: RefToken | SysToken | ModeToken | RoleToken,
    mode: UnthemeColorMode,
  ) => {
    const tkns = use(mode);
    const fTkn: (t: typeof token) => string = (tkn) =>
      tkns[tkn] in tkns ? fTkn(tkns[tkn]) : tkns[tkn];
    return fTkn(token);
  };

  const setTheme = (theme: UnthemeSysTokens<RefToken, SysToken>) => {
    currentTheme = theme;
  };

  const getTheme = () => currentTheme;

  const tokens = () => {
    const tokens = use("dark"); // mode tokens are congruent, just grab dark
    return Object.keys(tokens) as (
      | RefToken
      | SysToken
      | ModeToken
      | RoleToken
    )[];
  };

  return {
    use,
    resolve,
    tokens,
    setTheme,
    getTheme,
  };
}
