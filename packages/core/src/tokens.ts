import type { UnthemeTokenScheme } from "@untheme/schema";
import { defu } from "defu";
// @ts-expect-error no types available
import kebabCase from "lodash.kebabcase";

export function mergeTokens(base: Partial<UnthemeTokenScheme>, ...layers: Partial<UnthemeTokenScheme>[]) {
    return defu(base, ...layers) as UnthemeTokenScheme;
}

export function manufactureTokenUtils(prefix: string, tokens: UnthemeTokenScheme) {
    type Token = keyof typeof tokens;

    function useTokens() {
        return Object.keys(tokens) as Token[];
    }

    function resolveToken(token: Token) {
        return tokens[token];
    }

    function editToken(token: Token, value: string) {
        tokens[token] = value;
        return resolveToken(token);
    }

    function useRootVars() {
        const rootVars = useTokens().map(token => `--${prefix}-${kebabCase(token)}: ${resolveToken(token)};`);
        return `:root{\n${rootVars.join("\n")}}`;
    }

    return {
        useTokens,
        resolveToken,
        editToken,
        useRootVars
    }
}