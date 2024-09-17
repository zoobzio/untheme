import type {
  UnthemeColorMode,
  UnthemeConfig,
  UnthemeTokenUtil,
} from "../types";

export function defineUnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  ModeToken extends string,
  RoleToken extends string,
>(config: UnthemeConfig<RefToken, SysToken, ThemeToken, ModeToken, RoleToken>) {
  return config;
}

export function defineUntheme<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  ModeToken extends string,
  RoleToken extends string,
>(config: UnthemeConfig<RefToken, SysToken, ThemeToken, ModeToken, RoleToken>) {
  const use: UnthemeTokenUtil<
    RefToken,
    SysToken,
    ThemeToken,
    ModeToken,
    RoleToken
  > = (theme, mode) => ({
    ...config.tokens,
    ...config.themes[theme],
    ...config.modes[mode],
    ...config.roles,
  });

  const resolve = (
    token: RefToken | SysToken | ModeToken | RoleToken,
    theme: ThemeToken,
    mode: UnthemeColorMode,
  ) => {
    const tkns = use(theme, mode);
    const fTkn: (t: typeof token) => string = (tkn) =>
      tkns[tkn] in tkns ? fTkn(tkns[tkn]) : tkns[tkn];
    return fTkn(token);
  };

  const themes: () => ThemeToken[] = () =>
    Object.keys(config.themes) as ThemeToken[];

  const tokens = () => {
    const theme = themes()[0]; // theme tokens are congruent, active theme doesn't matter here so just grab the first
    const tokens = use(theme, "dark"); // mode tokens are congruent, just grab dark
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
    themes,
    tokens,
  };
}
