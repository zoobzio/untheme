// extend theme options as needed: https://github.com/unocss/unocss/blob/main/packages/preset-mini/src/_theme/types.ts
export type UnthemeTemplate =
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

export type UnthemeTheme = {
  [T in UnthemeTemplate]?: Record<string, string>;
};

export interface UnthemePresetOptions {
  prefix?: string;
  config: {
    tokens: Record<string, string>;
    themes: Record<string, Record<string, string>>;
    roles: Record<string, string>;
  };
  templates: {
    [Template in UnthemeTemplate]?: RegExp;
  };
}
