export type UnthemeTokenScheme = {
    [key: string]: string | UnthemeTokenScheme;
};

export interface Untheme {
    tokens: UnthemeTokenScheme;
    utils: {
        [key: string]: (...args: any) => any;
    }
}

export type UnthemePluginCallback<Options> = (options: Options) => Untheme;

export interface UnthemeCoreConfig {
    prefix: string

    tokens: UnthemeTokenScheme;

    plugins?: Untheme[];
}
