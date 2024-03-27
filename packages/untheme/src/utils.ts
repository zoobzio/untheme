import type { UnthemeConfig, UnthemeTokens } from "./types";

export function defineUntheme<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
  RoleToken extends string,
>(config: UnthemeConfig<RefToken, SysToken, Theme, RoleToken>) {
  const use: (theme: Theme) => UnthemeTokens<RefToken, SysToken, RoleToken> = (
    theme: Theme,
  ) => ({
    ...config.tokens,
    ...config.themes[theme],
    ...config.roles,
  });

  const themes: () => Theme[] = () => Object.keys(config.themes) as Theme[];

  const tokens = () => {
    const theme = themes()[0]; // theme keys are congruent, active theme doesn't matter here so just grab the first
    const tokens = use(theme);
    return Object.keys(tokens) as (RefToken | SysToken | RoleToken)[];
  };

  return {
    use,
    themes,
    tokens,
  };
}
