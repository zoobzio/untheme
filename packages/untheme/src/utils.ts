import type {
  UnthemeColorMode,
  UnthemeConfig,
  UnthemeTemplate,
  UnthemeTokenUtil,
} from "./types";

export function isUnthemeConfig(data: unknown): data is UnthemeTemplate {
  return (
    data !== null &&
    typeof data === "object" &&
    "tokens" in data &&
    data.tokens !== null &&
    typeof data.tokens === "object" &&
    Object.values(data.tokens).every((v) => typeof v === "string") &&
    "themes" in data &&
    data.themes !== null &&
    typeof data.themes === "object" &&
    Object.values(data.themes).every(
      (v) =>
        typeof v === "object" &&
        Object.values(v).every((t) => typeof t === "string"),
    ) &&
    "modes" in data &&
    data.modes !== null &&
    typeof data.modes === "object" &&
    Object.values(data.modes).every(
      (v) =>
        typeof v === "object" &&
        Object.values(v).every((t) => typeof t === "string"),
    ) &&
    "roles" in data &&
    data.roles !== null &&
    typeof data.roles === "object" &&
    Object.values(data.roles).every((v) => typeof v === "string")
  );
}

export function defineUnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  ModeToken extends string,
  RoleToken extends string,
>(config: UnthemeConfig<RefToken, SysToken, ThemeToken, ModeToken, RoleToken>) {
  return config;
}

export function defineUntheme<
  RefToken extends string,
  SysToken extends string,
  ThemeToken extends string,
  ModeToken extends string,
  RoleToken extends string,
>(config: UnthemeConfig<RefToken, SysToken, ThemeToken, ModeToken, RoleToken>) {
  type TokenUnion = RefToken | SysToken | ModeToken | RoleToken;

  const use: UnthemeTokenUtil<
    RefToken,
    SysToken,
    ThemeToken,
    ModeToken,
    RoleToken
  > = (theme, mode) => ({
    ...config.tokens,
    ...config.themes[theme],
    ...config.modes[mode],
    ...config.roles,
  });

  const resolve = (
    token: TokenUnion,
    theme: ThemeToken,
    mode: UnthemeColorMode,
  ) => {
    const tkns = use(theme, mode);
    const fTkn: (t: typeof token) => string = (tkn) =>
      tkns[tkn] in tkns ? fTkn(tkns[tkn]) : tkns[tkn];
    return fTkn(token);
  };

  const modes = () => Object.keys(config.modes) as UnthemeColorMode[];

  const themes = () => Object.keys(config.themes) as ThemeToken[];

  const tokens = () => {
    const theme = themes()[0]; // theme tokens are congruent, active theme doesn't matter here so just grab the first
    const tokens = use(theme, "dark"); // mode tokens are congruent, just grab dark
    return Object.keys(tokens) as TokenUnion[];
  };

  return {
    use,
    resolve,
    modes,
    themes,
    tokens,
  };
}
