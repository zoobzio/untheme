import type { UnthemeConfig, UnthemePlugin } from "./types";

export function defineUnthemePlugin<Token extends string, Options extends UnthemeConfig>(
    plugin: UnthemePlugin<Token, Options>,
    options: Options
) {
    return plugin(options);
}