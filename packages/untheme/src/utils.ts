import type { UnthemeConfig, UnthemeTokenUtil } from "./types";

export function defineUnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  RoleToken extends string,
  ModeToken extends string
>(config: UnthemeConfig<RefToken, SysToken, ThemeToken, RoleToken, ModeToken>) {
  return config;
}

export function defineUntheme<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  RoleToken extends string,
  ModeToken extends string
>(config: UnthemeConfig<RefToken, SysToken, ThemeToken, RoleToken, ModeToken>) {
  const use: UnthemeTokenUtil<
    RefToken,
    SysToken,
    ThemeToken,
    RoleToken,
    ModeToken
  > = (theme, mode) => ({
    ...config.tokens,
    ...config.themes[theme],
    ...config.modes[mode],
    ...config.roles,
  });

  const themes: () => ThemeToken[] = () =>
    Object.keys(config.themes) as ThemeToken[];

  const tokens = () => {
    const theme = themes()[0]; // theme tokens are congruent, active theme doesn't matter here so just grab the first
    const tokens = use(theme, "dark"); // mode tokens are congruent, just grab dark
    return Object.keys(tokens) as (RefToken | SysToken | RoleToken)[];
  };

  return {
    use,
    themes,
    tokens,
  };
}
