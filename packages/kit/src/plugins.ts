import { defu } from "defu";
import type { UnthemePluginCallback } from "@untheme/schema";

export function defineUnthemePlugin<Options extends {}>(
    callback: UnthemePluginCallback<Options>,
    defaults: Partial<Options>,
) {
    return (options: Partial<Options>) => {
        const withDefaults = defu(options, defaults) as Options;
        return callback(withDefaults);
    }
}