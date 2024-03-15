import type { UnthemeColorConfig, UnthemeColorPack, UnthemeColorShade, UnthemeColorRole, UnthemeColorMode } from "./types";
import packs from "./packs";
import { UnthemeTokenScheme } from "@untheme/kit";

export function useColorPack(pack: UnthemeColorPack) {
    return packs[pack];
}

export function useColorTheme<Role extends string, Color extends string>({ prefix, colors: { mode, scheme, roles }}: UnthemeColorConfig<Role, Color>) {
    let tokens = {} as UnthemeTokenScheme<Role>;

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

    function useColorRoles() {
        return Object.keys(roles) as Role[];
    }

    function resolveColorRole(token: Role) {
        const _token = roles[token];
        return scheme[_token.color][_token[mode]];
    }

    function resolveRoleTokens() {
        tokens = useColorRoles().reduce((x,y) => {
            x[y] = resolveColorRole(y)
            return x;
        }, {} as UnthemeTokenScheme<Role>);
    }

    function setColorRole(token: Role, role: Partial<UnthemeColorRole<Role, Color>>) {
        roles[token] = {
            ...roles[token],
            ...role
        }
        resolveRoleTokens();
        return resolveColorRole(token);
    }

    function setColorMode(colorMode?: UnthemeColorMode) {
        mode = colorMode ? colorMode : (mode === "dark" ? "light" : "dark");
        resolveRoleTokens();
        return mode;
    }

    resolveRoleTokens();

    return {
        tokens,
        useColors,
        resolveColor,
        useColorShades,
        resolveColorShade,
        useColorRoles,
        resolveColorRole,
        setColorRole,
        setColorMode,
    }
}