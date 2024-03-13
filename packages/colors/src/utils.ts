import type { UnthemeColorMode, UnthemeColorPack, UnthemeColorPluginConfig, UnthemeColorShade, UnthemeColorToken } from "./types";
import packs from "./packs";

export function useColorPack(pack: UnthemeColorPack) {
    return packs[pack];
}

export function manufactureColorUtils({ mode, scheme, tokens }: UnthemeColorPluginConfig) {
    type Color = keyof typeof scheme;
    type Token = keyof typeof tokens;

    function useColors() {
        return Object.keys(scheme) as Color[];
    }

    function resolveColor(color: Color) {
        return scheme[color];
    }

    function useColorShades(color: Color) {
        return Object.keys(resolveColor(color)).map(k => parseInt(k)) as UnthemeColorShade[];
    }

    function resolveColorShade(color: Color, shade: 0 | UnthemeColorShade | 1000) {
        switch(shade) {
            case 0:
                return "#fff";
            case 1000:
                return "#000";
            default:
                return resolveColor(color)[shade];
        }
    }

    function useColorTokens() {
        return Object.keys(tokens) as Token[];
    }

    function resolveColorToken(token: Token) {
        const _token = tokens[token];
        return scheme[_token.color][_token[mode]];
    }

    function setColorToken(token: Token, colorToken: Partial<UnthemeColorToken>) {
        tokens[token] = {
            ...tokens[token],
            ...colorToken
        }
        return resolveColorToken(token);
    }

    function setColorMode(colorMode?: UnthemeColorMode) {
        if (!colorMode) {
            mode = mode === "dark" ? "light" : "dark";
            return mode;
        }

        mode = colorMode;
        return mode;
    }
    
    return {
        useColors,
        resolveColor,
        useColorShades,
        resolveColorShade,
        useColorTokens,
        resolveColorToken,
        setColorToken,
        setColorMode,
    }
}