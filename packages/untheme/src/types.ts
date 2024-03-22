type NoInfer<T> = [T][T extends any ? 0 : never];

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

export type UnthemeTokens<
  RefToken extends string,
  SysToken extends string,
> = UnthemeRefTokens<RefToken> & UnthemeSysTokens<RefToken, SysToken>;

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

export type UnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
> = {
  tokens: UnthemeRefTokens<RefToken>;
  themes: UnthemeThemes<RefToken, SysToken, Theme>;
};

export interface Config {
  <RefToken extends string, SysToken extends string, Theme extends string>(config: any): Promise<UnthemeConfig<RefToken, SysToken, Theme>>;
}

export interface Untheme {
  <RefToken extends string, SysToken extends string, Theme extends string>(
    config: UnthemeConfig<RefToken, SysToken, Theme>,
  ): (theme: Theme) => UnthemeTokenUtils<RefToken> &
    UnthemeThemeUtils<RefToken, SysToken> & {
      getTokens: () => UnthemeTokens<RefToken, SysToken>;
      listTokens: () => (RefToken | SysToken)[];
      resolveToken: (token: RefToken | SysToken) => string;
      editToken: <Token>(
        token: Token extends RefToken ? RefToken : SysToken,
        value: Token extends RefToken ? string : RefToken,
      ) => string;
    };
}
