import { useUnthemeTokenCSSVars } from "untheme";
import { defineUntheme } from "untheme";
import type { UnthemeTemplate } from "untheme";

// https://github.com/unocss/unocss/blob/main/packages/preset-mini/src/_theme/types.ts
export type UnthemePresetUnocssThemeKey =
  | "width"
  | "height"
  | "maxWidth"
  | "maxHeight"
  | "minWidth"
  | "minHeight"
  | "inlineSize"
  | "blockSize"
  | "maxInlineSize"
  | "maxBlockSize"
  | "minInlineSize"
  | "minBlockSize"
  | "borderRadius"
  | "breakpoints"
  | "verticalBreakpoints"
  | "colors"
  | "borderColor"
  | "backgroundColor"
  | "textColor"
  | "shadowColor"
  | "accentColor"
  | "fontFamily"
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "letterSpacing"
  | "wordSpacing"
  | "boxShadow"
  | "textIndent"
  | "textShadow"
  | "textStrokeWidth"
  | "ringWidth"
  | "lineWidth"
  | "spacing"
  | "duration"
  | "aria"
  | "data"
  | "zIndex"
  | "blur"
  | "dropShadow"
  | "easing"
  | "media"
  | "supports"
  | "containers"
  | "animation"
  | "gridAutoColumn"
  | "gridAutoRow"
  | "gridColumn"
  | "gridRow"
  | "gridTemplateColumn"
  | "gridTemplateRow";

export type UnthemePresetUnocssTheme = {
  [T in UnthemePresetUnocssThemeKey]?: Record<string, string>;
};

export interface UnthemePresetOptions<Config extends UnthemeTemplate> {
  config: Config;
  templates: {
    [Template in UnthemePresetUnocssThemeKey]?: RegExp;
  };
}

export function presetUntheme<Config extends UnthemeTemplate>(
  options: UnthemePresetOptions<Config>,
) {
  const untheme = defineUntheme(options.config);
  type Template = keyof typeof options.templates;
  return {
    name: "unocss-preset-untheme",
    theme: (Object.keys(options.templates) as Template[]).reduce((x, y) => {
      const template = options.templates[y];
      x[y] = useUnthemeTokenCSSVars(
        untheme.tokens().filter((tkn) => !template || template.test(tkn)),
      );
      return x;
    }, {} as UnthemePresetUnocssTheme),
  };
}
