import packs from "./packs";
import type {
  UnthemeColor,
  UnthemeColorShade,
  UnthemeColorPack,
} from "./types";
import { useTokenize } from "@untheme/kit";

// `untheme` depends on strongly-typed string keys, but color definitions are numeric by convention so use this instead of object keys
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

export function useColorTokens<
  P extends string,
  N extends string,
  X extends string,
>(color: UnthemeColor, prefix: P, name: N, separator: X) {
  const tokens = shades.map((k) => useTokenize(separator, prefix, name, k));
  return tokens.reduce(
    (x, y, i) => {
      x[y] = color[parseInt(shades[i]) as UnthemeColorShade];
      return x;
    },
    {} as Record<(typeof tokens)[number], string>,
  );
}

export function referenceColorTokens<
  P extends keyof typeof packs,
  C extends keyof (typeof packs)[P] & string,
  N extends string,
  X extends string,
>(pack: P, color: C, name: N, separator: X) {
  const tokens = shades.map((s) => useTokenize(separator, pack, name, s));
  return tokens.reduce(
    (x, y, i) => {
      x[y] = useTokenize(separator, pack, color, shades[i]);
      return x;
    },
    {} as Record<(typeof tokens)[number], string>,
  );
}

export function useColorPack<
  P extends keyof typeof packs,
  C extends keyof (typeof packs)[P] & string,
  X extends string,
>(pack: P, colors: C[], separator: X) {
  const scheme = colors.reduce(
    (scheme, key) => {
      scheme[key] = packs[pack][key];
      return scheme;
    },
    {} as Pick<(typeof packs)[P], C>,
  );
  const keys = Object.keys(scheme) as (keyof typeof scheme)[];
  const tokens = keys.map((k) =>
    useColorTokens(scheme[k] as UnthemeColor, pack, k, separator),
  );
  return Object.assign({}, ...tokens) as Record<
    keyof (typeof tokens)[number],
    string
  >;
}

export function useCustomColorPack<
  C extends string,
  P extends string,
  X extends string,
>(pack: UnthemeColorPack<C>, prefix: P, separator: X) {
  const keys = Object.keys(pack) as C[];
  const tokens = keys.map((k) =>
    useColorTokens(pack[k] as UnthemeColor, prefix, k, separator),
  );
  return Object.assign({}, ...tokens) as Record<
    keyof (typeof tokens)[number],
    string
  >;
}
