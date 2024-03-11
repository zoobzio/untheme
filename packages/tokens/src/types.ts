export type ColorToken = {
    dark: string;
    light: string;
}

export type ColorTokenMode = keyof ColorToken;

export type Token = {
    [key: string]: string;
}