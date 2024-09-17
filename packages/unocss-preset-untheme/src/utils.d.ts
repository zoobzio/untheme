import type { UnthemeTemplate } from "untheme";
import type { UnthemePresetOptions, UnthemeTheme } from "./types";
export declare function presetUntheme<Config extends UnthemeTemplate>(options: UnthemePresetOptions<Config>): {
    name: string;
    theme: UnthemeTheme;
};
