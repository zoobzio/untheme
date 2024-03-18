import type { UnthemeTokens } from "@untheme/kit";
import type { UnthemeCorePluginInput, UnthemeCorePlugin } from "./types";

export function useCoreTheme<Token extends string>({ tokens }: UnthemeCorePluginInput<Token>): UnthemeCorePlugin<Token> {
    const useTokens = () => Object.keys(tokens) as Token[];
    const resolveToken = (token: Token) => tokens[token];
    const editToken = (token: Token, value: string) => tokens[token] = value;
    return {
        tokens: () => useTokens().reduce((x, y) => {
            x[y] = resolveToken(y);
            return x;
        }, {} as UnthemeTokens<Token>),
        useTokens,
        resolveToken,
        editToken,
    };
}