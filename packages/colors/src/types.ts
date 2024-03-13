export type UnthemeColorPack = keyof typeof import("./packs")["default"];

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

export type UnthemeColorToken = {
    [key: string]: {
        color: keyof UnthemeColorPluginConfig["scheme"];
    } & {
        [Property in UnthemeColorMode]: UnthemeColorShade;
    }
};

export interface UnthemeColorPluginConfig {
    mode: UnthemeColorMode;
    scheme: {
        [key: string]: UnthemeColorDefinition;
    };
    tokens: UnthemeColorToken;
}