import { useTokenVars } from "@untheme/kit";
import { defineUntheme } from "untheme";
import type { UnthemePresetOptions, UnthemeTheme } from "./types";

export function presetUntheme(options: UnthemePresetOptions) {
  const untheme = defineUntheme(options.config);
  type Template = keyof typeof options.templates;
  return {
    name: "unocss-preset-untheme",
    theme: (Object.keys(options.templates) as Template[]).reduce((x, y) => {
      const template = options.templates[y];
      x[y] = useTokenVars(
        untheme.tokens().filter((tkn) => !template || template.test(tkn)),
        options.prefix,
      );
      return x;
    }, {} as UnthemeTheme),
  };
}
