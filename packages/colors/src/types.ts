import type { UnthemePluginInput, UnthemePluginOutput } from "@untheme/kit";

export type UnthemeColorPacks = typeof import("./packs")["default"];

export type UnthemeColorPack = keyof UnthemeColorPacks;

export type UnthemeColors = keyof UnthemeColorPacks[UnthemeColorPack];

export type UnthemeColorDefinition = {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
};

export type UnthemeColorShade = keyof UnthemeColorDefinition;

export type UnthemeColorMode = "dark" | "light";

export type UnthemeColorRole<Role extends string, Color extends string> = {
    [Property in Role]: {
        color: Color; // TODO: there is a bug here, this changes the expected outcome of the `Color` generic
    } & {
        [Property in UnthemeColorMode]: UnthemeColorShade;
    }
};

export interface UnthemeColorPluginInput<Role extends string, Color extends string> extends UnthemePluginInput {
    colors: {
        mode: UnthemeColorMode;
        scheme: {
            [Property in Color]: UnthemeColorDefinition;
        };
        roles: UnthemeColorRole<Role, Color>;
    }
}

export interface UnthemeColorPlugin<Role extends string, Color extends string> extends UnthemePluginOutput<Role> {
    useColors: () => Color[];
    resolveColor: (color: Color) => UnthemeColorDefinition;
    useColorShades: (color: Color) => UnthemeColorShade[];
    resolveColorShade: (color: Color, shade: UnthemeColorShade) => string;
    useColorRoles: () => Role[];
    resolveColorRoleToken: (role: Role) => string;
    setColorRole: (role: Role, value: Partial<UnthemeColorRole<Role, Color>>) => void;
    setColorMode: (mode?: UnthemeColorMode) => UnthemeColorMode;
}