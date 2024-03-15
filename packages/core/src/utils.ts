import type { UnthemeCoreConfig } from "./types";

export function useCoreTheme<Token extends string>({ tokens }: UnthemeCoreConfig<Token>) {
    const useTokens = () => Object.keys(tokens) as Token[];
    const resolveToken = (token: Token) => tokens[token];
    const editToken = (token: Token, value: string) => tokens[token] = value;
    return {
        tokens,
        useTokens,
        resolveToken,
        editToken,
    }
}