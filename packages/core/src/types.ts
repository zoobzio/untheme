import type { UnthemeConfig, UnthemeTokenScheme } from "@untheme/kit";

export interface UnthemeCoreConfig<Token extends string> extends UnthemeConfig {
    tokens: UnthemeTokenScheme<Token>;
}