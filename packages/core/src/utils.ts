import type { Untheme, UnthemeCoreConfig } from "@untheme/schema";
import { manufactureTokenUtils, mergeTokens } from "./tokens";

let untheme: Untheme;

export function useUntheme() {
    if (!untheme) {
        throw new Error("Untheme not initialized!");
    }
    return untheme;
}

export function manufactureUntheme(core: UnthemeCoreConfig) {
    let tokens = mergeTokens(core.tokens);
    if (core.layers) {
        tokens = mergeTokens(tokens, ...core.layers.map(({ tokens }) => ({ tokens })));
    }

    let utils = manufactureTokenUtils(core.prefix, tokens);
    if (core.layers) {
        utils = core.layers.reduce((x,y) => {
            x = {
                ...x,
                ...y.utils,
            }
            return x;
        }, utils);
    }

    untheme = {
        tokens,
        utils
    }

    return useUntheme();
}