import { useUnthemeConfig } from "@untheme/core";
import { kebabCase } from "lodash";
import { ColorTokenMode, Token } from "./types";

export function useUnthemeColorTokenList() {
    const { colorTokens }  = useUnthemeConfig();
    return Object.keys(colorTokens || {});
}

export function useUnthemeColorToken(token: string, mode: ColorTokenMode) {
    const { colorTokens } = useUnthemeConfig();
    if (!colorTokens || !(token in colorTokens)) {
        throw new Error("🎨 Invalid color token!");
    }
    return colorTokens[token][mode]
}

export function useUnthemeColorTokenVars(mode: ColorTokenMode) {
    const { prefix } = useUnthemeConfig();
    return useUnthemeColorTokenList().reduce((x, y) => {
        const key = `--${kebabCase(prefix || "z")}-${kebabCase(y)}`;
        const val = useUnthemeColorToken(y, mode);
        x += `${key}: ${val};\n`;
        return x;
    }, "");
}

export function useUnthemeTokenList() {
    const { tokens } = useUnthemeConfig();
    return Object.keys(tokens || {});
}

export function useUnthemeToken(token: string) {
    const { tokens } = useUnthemeConfig();
    if (!tokens) {
        throw new Error("Invalid token!")
    }
    return tokens[token];
}

export function useUnthemeTokenVars() {
    const { prefix } = useUnthemeConfig();
    return useUnthemeTokenList().reduce((x, y) => {
        const key = `--${kebabCase(prefix || "z")}-${kebabCase(y)}`;
        const val = useUnthemeToken(y);
        x += `${key}: ${val};\n` ;
        return x;
    }, "");
}