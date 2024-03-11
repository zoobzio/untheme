import { ColorTokenMode, useUnthemeColorTokenVars, useUnthemeTokenVars } from "@untheme/tokens";
import { useHead } from "unhead";
import { UserConfig } from "./types";
import { setUnthemeConfig } from "./config";

export function applyUntheme(config: UserConfig = {}, mode: ColorTokenMode) {
    setUnthemeConfig(config);

    const tokenVars = useUnthemeTokenVars();
    const colorVars = useUnthemeColorTokenVars(mode);

    const root = `:root {\n${tokenVars + colorVars}\n}`;

    useHead({
        style: [
            {
                innerHTML: () => root,
            }
        ]
    });
}