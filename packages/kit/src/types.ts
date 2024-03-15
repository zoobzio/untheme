export type UnthemeTokenScheme<Token extends string> = {
    [Property in Token]: string;
};

export interface UnthemeConfig {
    prefix: string;
}

export interface UnthemePluginInput {
    name: string;
}

export interface UnthemePluginOutput<Token extends string> {
    tokens?: UnthemeTokenScheme<Token>;
}

export type UnthemePlugin<Token extends string, Options extends UnthemeConfig> = (options: Options) => UnthemePluginOutput<Token>;