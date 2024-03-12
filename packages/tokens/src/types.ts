import type { ColorShade } from "@untheme/colors";

export type ColorToken = {
    color: string;
    dark: ColorShade;
    light: ColorShade;
}

export type ColorTokenMode = keyof ColorToken;

export type TokenScheme = {
    root: {
        [key: string]: string;
    }
    colors: {
        [key: string]: ColorToken;
    }
}

export type TokenGroup = keyof TokenScheme;