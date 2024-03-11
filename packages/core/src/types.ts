import type { ColorScheme } from "@untheme/colors";
import { ColorToken, Token } from "@untheme/tokens";

export interface UserConfig {
    prefix?: string;

    colors?: ColorScheme;

    colorTokens?: {
        [key: string]: ColorToken;
    }

    tokens?: Token;
}