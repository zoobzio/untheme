export type { ColorPack } from "./packs";

export type ColorDefinition = {
    0?: string;
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
    1000?: string;
};

export type ColorShade = keyof ColorDefinition;

export type ColorScheme = {
    [key: string]: ColorDefinition;
}

export type Color = keyof ColorScheme;