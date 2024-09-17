import type { UnthemeTemplate } from "untheme";
export type UnthemeUtilityTemplate = "width" | "height" | "maxWidth" | "maxHeight" | "minWidth" | "minHeight" | "inlineSize" | "blockSize" | "maxInlineSize" | "maxBlockSize" | "minInlineSize" | "minBlockSize" | "borderRadius" | "breakpoints" | "verticalBreakpoints" | "colors" | "borderColor" | "backgroundColor" | "textColor" | "shadowColor" | "accentColor" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing" | "wordSpacing" | "boxShadow" | "textIndent" | "textShadow" | "textStrokeWidth" | "ringWidth" | "lineWidth" | "spacing" | "duration" | "aria" | "data" | "zIndex" | "blur" | "dropShadow" | "easing" | "media" | "supports" | "containers" | "animation" | "gridAutoColumn" | "gridAutoRow" | "gridColumn" | "gridRow" | "gridTemplateColumn" | "gridTemplateRow";
export type UnthemeTheme = {
    [T in UnthemeUtilityTemplate]?: Record<string, string>;
};
export interface UnthemePresetOptions<Config extends UnthemeTemplate> {
    config: Config;
    templates: {
        [Template in UnthemeUtilityTemplate]?: RegExp;
    };
}
