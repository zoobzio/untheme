import type { Untheme, UnthemeCore, UnthemeColors } from "./types";

export const defineUntheme: Untheme = (config) => {
    let tokens: Record<string, string> = {};
    
    const useCoreTheme: UnthemeCore = (core) => {
        return {
            listTokens: <T extends string>() => Object.keys(core) as T[],
            resolveToken: (token: keyof typeof core) => core[token],
            editToken: (token: keyof typeof core, value: string) => core[token] = value,
        }
    }

    const useColorTheme: UnthemeColors<keyof typeof config.colors> = (colors) => {
        return {
            listRoles: <C extends string>() => Object.keys(colors) as C[],
            resolveRole: (role: keyof typeof colors) => colors[role],
            editRole: (role: keyof typeof colors, options: Partial<typeof colors[typeof role]>) => colors[role] = { ...colors[role], ...options },
        }
    }

    return {
        useTokens: () => tokens,
        useCoreTheme,
        useColorTheme,
    }
}