import { definePreset } from "@unocss/core";
import { useTokenCSSVars } from "@untheme/shared";
import unthemeRules from "./rules";
import type { UnthemeUnoOptions, UnthemeUnoTemplate } from "./types";

function unthemeUnocssPreset<
  Token extends string,
  Template extends UnthemeUnoTemplate,
>(options: UnthemeUnoOptions<Token, Template>) {
  const tokens = Object.keys(options.tokens) as Token[];
  const templates = Object.keys(options.template) as Template[];

  const theme = templates.reduce(
    (x, y) => {
      let template = options.template[y];
      x[y] = useTokenCSSVars(
        tokens.filter((tkn) => template.test(tkn)),
        options.prefix,
      );
      return x;
    },
    {} as {
      [T in Template]: {
        [K in Token]: string;
      };
    },
  );

  const rules = templates
    .map((t) => {
      switch (t) {
        case "spacing":
          return unthemeRules.spacing;
        default:
          return;
      }
    })
    .flat();

  return {
    name: "untheme-preset",
    theme,
    rules,
  };
}

export default definePreset(unthemeUnocssPreset);
