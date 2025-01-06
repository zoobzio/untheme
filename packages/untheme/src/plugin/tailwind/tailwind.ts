import { useTailwindColorPack } from "./colors";
import { useTailwindRadiusPack } from "./radius";
import { useTailwindSpacingPack } from "./spacing";
import { useTailwindTypesizePack } from "./textsize";

export type UnthemeTailwindConfig = {
  colors?: Parameters<typeof useTailwindColorPack>[0];
  radius?: Parameters<typeof useTailwindRadiusPack>[0];
  spacing?: Parameters<typeof useTailwindSpacingPack>[0];
  typesize?: Parameters<typeof useTailwindTypesizePack>[0];
};

export function useTailwindTokenPack({
  colors,
  radius,
  spacing,
  typesize,
}: UnthemeTailwindConfig = {}) {
  return {
    colors: useTailwindColorPack(colors),
    radius: useTailwindRadiusPack(radius),
    spacing: useTailwindSpacingPack(spacing),
    typesize: useTailwindTypesizePack(typesize),
  };
}
