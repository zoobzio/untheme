import type { UnthemeColorMode, UnthemeColorScheme, UnthemeColorShade } from "@untheme/colors";

export interface UnthemeCore {
    <Token extends string>(
        config: {
            [T in Token]: string;
        }
    ): {
        listTokens: () => Token[];
        resolveToken: (token: Token) => string;
        editToken: (token: Token, value: string) => string; 
    }
}

export interface UnthemeColors<Color extends string> {
    <Role extends string>(
        config: {
            [R in Role]: {
                color: ReturnType<() => Color>;
            } & {
                [M in UnthemeColorMode]: UnthemeColorShade;
            }       
        }
    ): {
        listRoles: () => Role[];
        resolveRole: (role: Role) => typeof config[Role];
        editRole: (role: Role, options: typeof config[Role]) => typeof config[Role];
    }
}

export interface Untheme {
    <Color extends string>(
        config: {
            prefix: string;
            colors: UnthemeColorScheme<Color>
        }
    ): {
        useCoreTheme: UnthemeCore;
        useColorTheme: UnthemeColors<Color>;
    }
}