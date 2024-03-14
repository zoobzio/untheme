import type { UnthemeColorPluginConfig } from "./types";
import { defineUnthemePlugin } from "@untheme/kit";
import { manufactureColorUtils } from "./utils";

export * from "./types";
export * from "./utils";

export const useColorPlugin = defineUnthemePlugin<UnthemeColorPluginConfig>((options) => {
    const utils = manufactureColorUtils(options);

    const colors = utils.useColors().reduce((x,y) => {
        utils.useColorShades(y).forEach(shade => {
            x[shade.toString()] = utils.resolveColorShade(y, shade);
        })
        return x;
    }, {} as Record<string, string>);

    const tokens = utils.useColorTokens().reduce((x,y) => {
        x[y] = utils.resolveColorToken(y);
        return x;
    }, {} as Record<keyof typeof options.tokens, string>);

    return {
        tokens: {
            ...tokens,
            colors,
        },
        utils,
    }
}, {});