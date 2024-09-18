import { useTokenize } from "../kit";

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

export function useColorTokenKeys<
  Name extends string,
  Color extends string,
  Pack extends UnthemeColorPack<Color>,
>(name: Name, pack: Pack) {
  return (Object.keys(pack) as Color[]).map((k) =>
    useColorTokens(pack[k], name, k),
  );
}

export function useColorTokens<Prefix extends string, Name extends string>(
  scheme: UnthemeColorScheme,
  prefix: Prefix,
  name: Name,
) {
  const tokens = shades.map((k) => useTokenize(prefix, name, k));
  return tokens.reduce(
    (x, y, i) => {
      x[y] = scheme[shades[i]];
      return x;
    },
    {} as Record<(typeof tokens)[number], string>,
  );
}

export function useColorPackTokens<
  Name extends string,
  Color extends string,
  Pack extends UnthemeColorPack<Color>,
>(name: Name, pack: Pack) {
  const keys = Object.keys(pack) as Color[];
  const tokens = keys.map((k) => useColorTokens(pack[k], name, k));
  return Object.assign({}, ...tokens) as Record<
    keyof (typeof tokens)[number],
    string
  >;
}
export function useColorAliasTokens<
  Name extends string,
  Color extends string,
  Pack extends UnthemeColorPack<Color>,
  Prefix extends string,
  Alias extends string,
>(
  name: Name,
  _pack: Pack,
  prefix: Prefix,
  aliases: Record<Alias, NoInfer<Color>>,
) {
  const keys = Object.keys(aliases) as Alias[];
  const tokens = keys
    .map((k) =>
      shades.map((s) => ({
        token: useTokenize(prefix, k, s),
        value: useTokenize(name, aliases[k], s),
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
export function defineColorPack<
  Name extends string,
  Color extends string,
  Pack extends UnthemeColorPack<Color>,
>(name: Name, pack: Pack) {
  return () => ({
    tokens: () => useColorPackTokens(name, pack),
    aliases: <Prefix extends string, Alias extends string>(
      prefix: Prefix,
      aliases: Record<Alias, NoInfer<Color>>,
    ) => useColorAliasTokens(name, pack, prefix, aliases),
  });
}
