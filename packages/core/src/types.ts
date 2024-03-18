import type { UnthemeTokens, UnthemePluginOutput, UnthemePluginInput } from "@untheme/kit";

export interface UnthemeCorePluginInput<Token extends string> extends UnthemePluginInput {
    tokens: UnthemeTokens<Token>;
}

export interface UnthemeCorePlugin<Token extends string> extends UnthemePluginOutput<Token> {
    useTokens: () => Token[];
    resolveToken: (token: Token) => string;
    editToken: (token: Token, value: string) => string;
}