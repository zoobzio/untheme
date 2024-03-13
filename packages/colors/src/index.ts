import { defineUnthemePlugin } from "@untheme/kit";
import { UnthemeColorPluginConfig } from "./types";
import { manufactureColorUtils } from "./utils";

export * from "./types";
export * from "./utils";

export const useUnthemeColorPlugin = defineUnthemePlugin<UnthemeColorPluginConfig>((options) => {
    const utils = manufactureColorUtils(options);

    const colors = utils.useColors().reduce((x,y) => {
        utils.useColorShades(y).forEach(shade => {
            x.colors[shade.toString()] = utils.resolveColorShade(y, shade);
        })
        return x;
    }, { colors: {} as Record<string, string> });

    const tokens = utils.useColorTokens().reduce((x,y) => {
        x[y] = ""
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