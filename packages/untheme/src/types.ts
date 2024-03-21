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

export type UnthemeTokens<
  RefToken extends string,
  SysToken extends string,
> = UnthemeRefTokens<RefToken> & UnthemeSysTokens<RefToken, SysToken>;

export type UnthemeRefUtils<RefToken extends string> = {
  getReferenceTokens: () => UnthemeRefTokens<RefToken>;
  listReferenceTokens: () => RefToken[];
  resolveReferenceToken: (token: RefToken) => string;
  editReferenceToken: (token: RefToken, value: string) => string;
}

export type UnthemeSysUtils<RefToken extends string, SysToken extends string> = {
  getSystemTokens: () => UnthemeSysTokens<RefToken, SysToken>;
  listSystemTokens: () => SysToken[];
  resolveSystemToken: (token: SysToken) => string;
  editSystemToken: (token: SysToken, value: NoInfer<RefToken>) => string;
}

export type UnthemeConfig<RefToken extends string, SysToken extends string, > = {
  refTokens: UnthemeRefTokens<RefToken>;
  sysTokens: UnthemeSysTokens<RefToken, SysToken>;
}

export interface Untheme {
  <RefToken extends string, SysToken extends string>(
    config: UnthemeConfig<RefToken, SysToken>
  ): UnthemeRefUtils<RefToken> &
    UnthemeSysUtils<RefToken, SysToken> & {
      getTokens: () => UnthemeTokens<RefToken, SysToken>;
      listTokens: () => (RefToken | SysToken)[];
      resolveToken: (token: RefToken | SysToken) => string;
    };
}
