export type UnthemeTokens<Token extends string> = {
    [Property in Token]: string;
}

export type UnthemePluginInput = {}

export type UnthemePluginOutput<Token extends string> = {
    tokens: () => UnthemeTokens<Token>;
}

export type Untheme<Prefix extends string> = {
    [Property in Prefix]: UnthemePluginOutput<any>;
}