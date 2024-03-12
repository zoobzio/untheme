import { defu } from "defu";
import { loadConfig } from "unconfig";
import { useColorPack } from "@untheme/colors";
import type { UnthemeConfig, UserConfig } from "./types";

const defaults = {
    prefix: "ut",
    colors: useColorPack("tailwind"),
} satisfies UnthemeConfig;

export function defineUnthemeConfig(config: Partial<UnthemeConfig>) {
    return defu(config, defaults);
}

export async function loadUnthemeConfig(config?: Partial<UnthemeConfig>) {
    return config ? defineUnthemeConfig(config) : await loadConfig<UserConfig>({
        sources: [
            {
                files: "untheme.config"
            }
        ]
    });

}