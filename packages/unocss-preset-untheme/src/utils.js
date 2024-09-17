import { useTokenVars } from "@untheme/kit";
import { defineUntheme } from "untheme";
export function presetUntheme(options) {
    const untheme = defineUntheme(options.config);
    return {
        name: "unocss-preset-untheme",
        theme: Object.keys(options.templates).reduce((x, y) => {
            const template = options.templates[y];
            x[y] = useTokenVars(untheme.tokens().filter((tkn) => !template || template.test(tkn)));
            return x;
        }, {}),
    };
}
