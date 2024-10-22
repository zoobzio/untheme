export type UnthemeColorMode = "dark" | "light"; // consider adding more here? accessibility modes maybe?

export type UnthemeRefTokens<RefToken extends string> = {
  [T in RefToken]: string;
};

export type UnthemeSysTokens<
  RefToken extends string,
  SysToken extends string,
> = {
  [S in SysToken]: NoInfer<RefToken>;
};

export type UnthemeThemes<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
> = {
  [T in ThemeToken]: UnthemeSysTokens<RefToken, SysToken>;
};

export type UnthemeModeTokens<
  RefToken extends string,
  SysToken extends string,
  ModeToken extends string,
> = {
  [M in ModeToken]: NoInfer<RefToken | SysToken>;
};

export type UnthemeRoleTokens<
  RefToken extends string,
  SysToken extends string,
  ModeToken extends string,
  RoleToken extends string,
> = {
  [R in RoleToken]: NoInfer<RefToken | SysToken | ModeToken>;
};

export type UnthemeToken<
  RefToken extends string,
  SysToken extends string,
  ModeToken extends string,
  RoleToken extends string,
> = RefToken | SysToken | ModeToken | RoleToken;

export type UnthemeTemplate = {
  tokens: Record<string, string>;
  themes: Record<string, Record<string, string>>;
  modes: {
    [M in UnthemeColorMode]: Record<string, string>;
  };
  roles: Record<string, string>;
};

export interface UnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  ModeToken extends string,
  RoleToken extends string,
> extends UnthemeTemplate {
  tokens: UnthemeRefTokens<RefToken>;
  themes: UnthemeThemes<RefToken, SysToken, ThemeToken>;
  modes: {
    [M in UnthemeColorMode]: UnthemeModeTokens<RefToken, SysToken, ModeToken>;
  };
  roles: UnthemeRoleTokens<RefToken, SysToken, ModeToken, RoleToken>;
}

export type UnthemeTokens<
  RefToken extends string,
  SysToken extends string,
  ModeToken extends string,
  RoleToken extends string,
> = UnthemeRefTokens<RefToken> &
  UnthemeSysTokens<RefToken, SysToken> &
  UnthemeModeTokens<RefToken, SysToken, ModeToken> &
  UnthemeRoleTokens<RefToken, SysToken, ModeToken, RoleToken>;

export type UnthemeTokenUtil<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  ModeToken extends string,
  RoleToken extends string,
> = (
  theme: ThemeToken,
  mode: UnthemeColorMode,
) => UnthemeTokens<RefToken, SysToken, ModeToken, RoleToken>;
