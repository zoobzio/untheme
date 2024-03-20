export type UnthemeColorPack = keyof typeof import("./packs")["default"];

export type UnthemeColorMode = "light" | "dark";

export type UnthemeColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type UnthemeColorDefinition = {
    [Shade in UnthemeColorShade]: string;
}

export type UnthemeColorScheme<Color extends string> = {
    [C in Color]: UnthemeColorDefinition;
}