import { UnthemeConfig } from "@untheme/kit";

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
        color: Color;
    } & {
        [Property in UnthemeColorMode]: UnthemeColorShade;
    }
};

export interface UnthemeColorConfig<Role extends string, Color extends string> extends UnthemeConfig {
    colors: {
        mode: UnthemeColorMode;
        scheme: {
            [Property in Color]: UnthemeColorDefinition;
        };
        roles: UnthemeColorRole<Role, Color>;
    }
}