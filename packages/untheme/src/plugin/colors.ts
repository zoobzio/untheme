import { useUnthemeTokenize } from "./kit";

const shades = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

export type UnthemeColorShade = (typeof shades)[number];

export type UnthemeColorScheme = {
  [Shade in UnthemeColorShade]: string;
};

export type UnthemeColorPack<Color extends string> = {
  [C in Color]: UnthemeColorScheme;
};

export type UnthemeColorPackOverride<Color extends string> = {
  [C in Color]?: Partial<UnthemeColorScheme>;
};

export function defineUnthemeColorTokenKeys<
  Name extends string,
  Color extends string,
>(name: Name, pack: UnthemeColorPack<Color>) {
  return (Object.keys(pack) as Color[]).map((k) =>
    defineUnthemeColorTokens(pack[k], name, k),
  );
}

export function defineUnthemeColorTokens<
  Prefix extends string,
  Name extends string,
>(scheme: UnthemeColorScheme, prefix: Prefix, name: Name) {
  const tokens = shades.map((k) => useUnthemeTokenize(prefix, name, k));
  return tokens.reduce(
    (x, y, i) => {
      x[y] = scheme[shades[i]];
      return x;
    },
    {} as Record<(typeof tokens)[number], string>,
  );
}

export function defineUnthemeColorPackTokens<
  Name extends string,
  Color extends string,
>(name: Name, pack: UnthemeColorPack<Color>) {
  const keys = Object.keys(pack) as Color[];
  const tokens = keys.map((k) => defineUnthemeColorTokens(pack[k], name, k));
  return Object.assign({}, ...tokens) as Record<
    keyof (typeof tokens)[number],
    string
  >;
}
export function defineUnthemeColorAliasTokens<
  Name extends string,
  Color extends string,
  Prefix extends string,
  Alias extends string,
>(
  name: Name,
  _pack: UnthemeColorPack<Color>,
  prefix: Prefix,
  alias: Record<Alias, Color>,
) {
  const keys = Object.keys(alias) as Alias[];
  const tokens = keys
    .map((k) =>
      shades.map((s) => ({
        token: useUnthemeTokenize(prefix, k, s),
        value: useUnthemeTokenize(name, alias[k], s),
      })),
    )
    .flat();
  return tokens.reduce(
    (x, y) => {
      x[y.token] = y.value;
      return x;
    },
    {} as Record<
      (typeof tokens)[number]["token"],
      (typeof tokens)[number]["value"]
    >,
  );
}

export function mergeUnthemeColorScheme<Color extends string>(
  pack: UnthemeColorPack<Color>,
  override: UnthemeColorPackOverride<Color>,
) {
  let scheme = { ...pack };
  (Object.keys(override) as Color[]).forEach((key) => {
    if (key in scheme && override[key]) {
      (Object.keys(override[key]) as UnthemeColorShade[]).forEach((shade) => {
        if (shade in scheme[key] && override[key] && override[key][shade]) {
          scheme[key][shade] = override[key][shade];
        }
      });
    }
  });
  return scheme;
}

export function defineUnthemeColorPack<
  Name extends string,
  Color extends string,
>(name: Name, pack: UnthemeColorPack<Color>) {
  return (override: UnthemeColorPackOverride<Color> = {}) => ({
    tokens: defineUnthemeColorPackTokens(
      name,
      mergeUnthemeColorScheme(pack, override),
    ),
    defineAlias: <Prefix extends string, Alias extends string>(
      prefix: Prefix,
      alias: Record<Alias, Color>,
    ) => defineUnthemeColorAliasTokens(name, pack, prefix, alias),
  });
}
