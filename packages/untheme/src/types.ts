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
  theme: Record<string, string>;
  modes: {
    [M in UnthemeColorMode]: Record<string, string>;
  };
  roles: Record<string, string>;
};

export interface UnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  ModeToken extends string,
  RoleToken extends string,
> extends UnthemeTemplate {
  tokens: UnthemeRefTokens<RefToken>;
  theme: UnthemeSysTokens<RefToken, SysToken>;
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
  ModeToken extends string,
  RoleToken extends string,
> = (
  mode: UnthemeColorMode,
) => UnthemeTokens<RefToken, SysToken, ModeToken, RoleToken>;
