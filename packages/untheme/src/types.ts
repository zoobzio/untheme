export type UnthemeTokens<Token extends string> = {
    [T in Token]: string;
}

export interface UnthemeCoreConfig<Token extends string> {
    tokens: UnthemeTokens<Token>;
}

export interface UnthemeCore {
    <Token extends string>(config: UnthemeCoreConfig<Token>): {
        listTokens: () => Token[];
        resolveToken: (token: Token) => string;
        editToken: (token: Token, value: string) => string;    
    }
}

export type UnthemeColorMode = "light" | "dark";

export type UnthemeColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type UnthemeColorDefinition = {
    [S in UnthemeColorShade]: string;
}

export type UnthemeColorRole<Color extends string> = {
    color: ReturnType<() => Color>;
} & {
    [M in UnthemeColorMode]: UnthemeColorShade;
}

export interface UnthemeColorConfig<Role extends string, Color extends string> {
    mode: UnthemeColorMode;
    scheme: {
        [C in Color]: UnthemeColorDefinition;
    }
    roles: {
        [R in Role]: UnthemeColorRole<Color>;
    }
}

export interface UnthemeColors {
    <Role extends string, Color extends string>(
        config: UnthemeColorConfig<Role, Color>
    ): {
        listColors: () => Color[];
        resolveColor: (color: Color) => UnthemeColorDefinition;
        listRoles: () => Role[];
        resolveRole: (role: Role) => UnthemeColorRole<Color>;
        resolveToken: (role: Role) => string;
        toggleColorMode: (mode?: UnthemeColorMode) => UnthemeColorMode;
    }
}