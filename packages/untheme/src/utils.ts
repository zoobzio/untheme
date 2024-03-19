import type { UnthemeColorConfig, UnthemeColorMode, UnthemeCoreConfig } from "./types";
import { defu } from "defu";
import packs from "./packs";

let tokens: Record<string, string> = {};

export function useTokens() {
    return tokens;
}

export function useColorPack(pack: keyof typeof import("./packs")["default"]) {
    return packs[pack];
}

export const useCoreTheme = <Token extends string>(config: UnthemeCoreConfig<Token>) => {
    tokens = defu(config.tokens, tokens);

    const listTokens = () => Object.keys(config.tokens) as Token[];
    const resolveToken = (token: Token) => tokens[token];
    const editToken = (token: Token, value: string) => tokens[token] = value;
    
    return {
        listTokens,
        resolveToken,
        editToken    
    }
}

export const useColorTheme = <Role extends string, Color extends string>(config: UnthemeColorConfig<Role, Color>) => {
    const listColors = () => Object.keys(config.scheme) as Color[];
    const resolveColor = (color: Color) => config.scheme[color];
    const listRoles = () => Object.keys(config.roles) as Role[];
    const resolveRole = (role: Role) => config.roles[role];
    const resolveToken = (role: Role) => {
        const colorRole = resolveRole(role);
        const shade = colorRole[config.mode];
        return tokens[role] = resolveColor(colorRole.color)[shade];
    }

    const resolve = () => listRoles().forEach(r => resolveToken(r));
    resolve();

    const editRole = (role: Role, color: Color) => {
        config.roles[role] = {
            ...config.roles[role],
            color
        }
        resolveToken(role);
        return resolveRole(role);
    }

    const toggleColorMode = (mode?: UnthemeColorMode) => {
        config.mode = mode ? mode : (config.mode === "dark" ? "light" : "dark");
        resolve();
        return config.mode;
    }

    return {
        listColors,
        resolveColor,
        listRoles,
        resolveRole,
        resolveToken,
        editRole,
        toggleColorMode
    }
}