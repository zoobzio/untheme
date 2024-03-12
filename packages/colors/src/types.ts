export type ColorPack = keyof typeof import("./packs")["default"];

export type ColorOption = keyof typeof import("./packs")["default"][ColorPack];

export type ColorShade = keyof typeof import("./packs")["default"][ColorPack][ColorOption];

export type ColorDefinition = {
    [Property in ColorShade]: string;
}

export type ColorScheme = {
    [key: string]: ColorDefinition;
}
