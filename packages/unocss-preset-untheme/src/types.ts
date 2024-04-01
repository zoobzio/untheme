// extend theme options as needed: https://github.com/unocss/unocss/blob/main/packages/preset-mini/src/_theme/types.ts
export type UnthemeTemplate =
  | "colors"
  | "spacing"
  | "width"
  | "height"
  | "fontSize"
  | "fontWeight"
  | "breakpoints"
  | "sizing";

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
