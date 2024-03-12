import type { UnthemeConfig } from "@untheme/config";
import type { Untheme } from "./types";

let untheme: Untheme;

export function getActiveUntheme() {
    if (!untheme) {
        throw new Error("No active theme!");
    }
    return untheme;
}

export function createUntheme(config: UnthemeConfig) {
    untheme = {
        config,
    };

    return getActiveUntheme();
}

export function useUntheme() {
    return getActiveUntheme();
}

/*
export function applyUntheme(config: UserConfig = {}, mode: ColorTokenMode) {
    setUnthemeConfig(config);

    const tokenVars = useUnthemeTokenVars();
    const colorVars = useUnthemeColorTokenVars(mode);

    const root = `:root {\n${tokenVars + colorVars}\n}`;

    useHead({
        style: [
            {
                innerHTML: () => root,
            }
        ]
    });
}
*/