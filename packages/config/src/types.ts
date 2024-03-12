import type { ColorScheme } from "@untheme/colors";
import type { TokenScheme } from "@untheme/tokens";

export interface UserConfig {
    prefix?: string;

    colors?: ColorScheme;

    tokens?: TokenScheme;
}

export interface UnthemeConfig {
    prefix: string;

    colors: ColorScheme;

    tokens: TokenScheme;
}