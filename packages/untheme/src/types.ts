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
}

export type UnthemeTokens<
  RefToken extends string,
  SysToken extends string,
  RoleToken extends string,
> = UnthemeRefTokens<RefToken> & UnthemeSysTokens<RefToken, SysToken> & UnthemeRoleTokens<RefToken, SysToken, RoleToken>;

export type UnthemeTokenUtils<RefToken extends string> = {
  getReferenceTokens: () => UnthemeRefTokens<RefToken>;
  listReferenceTokens: () => RefToken[];
  resolveReferenceToken: (token: RefToken) => string;
  editReferenceToken: (token: RefToken, value: string) => string;
};

export type UnthemeThemeUtils<
  RefToken extends string,
  SysToken extends string,
> = {
  getSystemTokens: () => UnthemeSysTokens<RefToken, SysToken>;
  listSystemTokens: () => SysToken[];
  resolveSystemToken: (token: SysToken) => string;
  editSystemToken: (token: SysToken, value: NoInfer<RefToken>) => string;
};

export type UnthemeRoleUtils<
  RefToken extends string,
  SysToken extends string,
  RoleToken extends string,
> = {
  getRoleTokens: () => UnthemeRoleTokens<RefToken, SysToken, RoleToken>;
  listRoleTokens: () => RoleToken[];
  resolveRoleToken: (token: RoleToken) => string;
  editRoleToken: (token: RoleToken, value: NoInfer<RefToken | SysToken>) => string;
}

export interface UnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
  RoleToken extends string,
> {
  tokens: UnthemeRefTokens<RefToken>;
  themes: UnthemeThemes<RefToken, SysToken, Theme>;
  roles: UnthemeRoleTokens<RefToken, SysToken, RoleToken>;
}

export interface Untheme {
  <RefToken extends string, SysToken extends string, Theme extends string, RoleToken extends string>(
    config: UnthemeConfig<RefToken, SysToken, Theme, RoleToken>,
  ): (theme: Theme) => UnthemeTokenUtils<RefToken> &
    UnthemeThemeUtils<RefToken, SysToken> & {
      getTokens: () => UnthemeTokens<RefToken, SysToken, RoleToken>;
      listTokens: () => (RefToken | SysToken | RoleToken)[];
      resolveToken: (token: RefToken | SysToken | RoleToken) => string;
      /*
      editToken: <Token>(
        token: Token extends RefToken ? RefToken : (Token extends SysToken ? SysToken : RoleToken),
        value: Token extends RefToken ? string : (Token extends SysToken ? RefToken : RefToken | SysToken),
      ) => string;
      */
    };
}
