type NoInfer<T> = [T][T extends any ? 0 : never];

export type UnthemeRefTokens<RefToken extends string> = {
  [T in RefToken]: string;
};

export interface UnthemeReference<RefToken extends string> {
  (referenceTokens: UnthemeRefTokens<RefToken>): {
    // defineSystemTokens: UnthemeSystem<ReferenceToken>;
    getReferenceTokens: () => typeof referenceTokens;
    listReferenceTokens: () => RefToken[];
    resolveReferenceToken: (token: RefToken) => string;
    editReferenceToken: (token: RefToken, value: string) => string;
  };
}

export type _UnthemeReference<RefToken extends string> = ReturnType<
  UnthemeReference<RefToken>
>;

export type UnthemeSystemTokens<
  SysToken extends string,
  RefToken extends string,
> = {
  [S in SysToken]: NoInfer<RefToken>;
};

export interface UnthemeSystem<
  SysToken extends string,
  RefToken extends string,
> {
  (systemTokens: UnthemeSystemTokens<SysToken, ReturnType<() => RefToken>>): {
    // defineComponentTokens: UnthemeComponent<Token & SystemToken>;
    getSystemTokens: () => typeof systemTokens;
    listSystemTokens: () => SysToken[];
    resolveSystemToken: (token: SysToken) => string;
    // editSystemToken: (variant: Variant, token: SystemToken, value: Token) => string;
  };
}

export type _UnthemeSystem<
  SysToken extends string,
  RefToken extends string,
> = ReturnType<UnthemeSystem<SysToken, RefToken>>;

export type UnthemeComponentTokens<
  CmpToken extends string,
  SysToken extends string,
  RefToken extends string,
> = {
  [C in CmpToken]: NoInfer<SysToken & RefToken>;
};

export interface UnthemeComponent<
  CmpToken extends string,
  SysToken extends string,
  RefToken extends string,
> {
  (componentTokens: UnthemeComponentTokens<CmpToken, SysToken, RefToken>): {
    getComponentTokens: () => typeof componentTokens;
    listComponentTokens: () => CmpToken[];
    resolveComponentToken: (token: CmpToken) => string;
    editComponentToken: (token: CmpToken, value: SysToken & RefToken) => string;
  };
}

export interface Untheme {
  <RefToken extends string, SysToken extends string>(
    config: {
      prefix: string;
    },
    referenceTokens: UnthemeRefTokens<RefToken>,
    systemTokens: UnthemeSystemTokens<SysToken, RefToken>,
  ): _UnthemeReference<RefToken> & _UnthemeSystem<SysToken, RefToken> & {};
}
