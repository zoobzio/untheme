import type { UnthemeColorPack } from "./types";

export function defineColorPack<Color extends string>(
  pack: UnthemeColorPack<Color>,
) {
  return pack;
}
