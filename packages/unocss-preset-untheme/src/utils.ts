import { useTokenCSSVars } from "@untheme/shared";
import type { UnthemePresetOptions, UnthemeTheme } from "./types";

export function presetUntheme(
  options: UnthemePresetOptions = {
    tokens: [],
    templates: {},
  },
) {
  type Template = keyof typeof options.templates;
  return {
    name: "unocss-preset-untheme",
    theme: (Object.keys(options.templates) as Template[]).reduce((x, y) => {
      const template = options.templates[y];
      x[y] = useTokenCSSVars(
        options.tokens.filter((tkn) => !template || template.test(tkn)),
        options.prefix,
      );
      return x;
    }, {} as UnthemeTheme),
  };
}
