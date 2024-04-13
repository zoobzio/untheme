export type NoInfer<T> = [T][T extends any ? 0 : never];

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
  Theme extends string,
> = {
  [V in Theme]: UnthemeSysTokens<RefToken, SysToken>;
};

export type UnthemeRoleTokens<
  RefToken extends string,
  SysToken extends string,
  RoleToken extends string,
> = {
  [R in RoleToken]: NoInfer<RefToken | SysToken>;
};

export type UnthemeToken<
  RefToken extends string,
  SysToken extends string,
  RoleToken extends string,
> = RefToken | SysToken | RoleToken;

export type UnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
  RoleToken extends string,
> = {
  tokens: UnthemeRefTokens<RefToken>;
  themes: UnthemeThemes<RefToken, SysToken, Theme>;
  roles: UnthemeRoleTokens<RefToken, SysToken, RoleToken>;
};

export type UnthemeTokens<
  RefToken extends string,
  SysToken extends string,
  RoleToken extends string,
> = UnthemeRefTokens<RefToken> &
  UnthemeSysTokens<RefToken, SysToken> &
  UnthemeRoleTokens<RefToken, SysToken, RoleToken>;
