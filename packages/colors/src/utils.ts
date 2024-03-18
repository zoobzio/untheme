import type { UnthemeColorPluginInput, UnthemeColorPack, UnthemeColorShade, UnthemeColorRole, UnthemeColorMode, UnthemeColorPlugin } from "./types";
import type { UnthemeTokens } from "@untheme/kit";
import packs from "./packs";


export function useColorPack(pack: UnthemeColorPack) {
    return packs[pack];
}

export function useColorTheme<Role extends string, Color extends string>({ colors: { mode, scheme, roles }}: UnthemeColorPluginInput<Role, Color>): UnthemeColorPlugin<Role, Color> {
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
        // TODO: consider removing hardset 0/100 values
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

    function resolveColorRole(role: Role) {
        return roles[role];
    }

    function resolveColorRoleToken(role: Role) {
        const token = resolveColorRole(role);
        return scheme[token.color][token[mode]];
    }

    function setColorRole(role: Role, value: Partial<UnthemeColorRole<Role, Color>>) {
        roles[role] = {
            ...roles[role],
            ...value,
        }
    }

    function setColorMode(colorMode?: UnthemeColorMode) {
        mode = colorMode ? colorMode : (mode === "dark" ? "light" : "dark");
        return mode;
    }

    return {
        tokens: () => ({
            ...useColorRoles().reduce((x,y) => {
                x[y] = resolveColorRoleToken(y);
                return x;
            }, {} as UnthemeTokens<Role>),
        }),
        useColors,
        resolveColor,
        useColorShades,
        resolveColorShade,
        useColorRoles,
        resolveColorRoleToken,
        setColorRole,
        setColorMode,
    }
}