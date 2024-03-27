export type UnthemeTemplate = "colors" | "spacing";

export type UnthemeTheme = {
  [T in UnthemeTemplate]?: Record<string, string>;
};

export interface UnthemePresetOptions {
  prefix?: string;
  tokens: string[];
  templates: {
    [Template in UnthemeTemplate]?: RegExp;
  };
}
