import type { UnthemeColorPack } from "./types";
import packs from "./packs";

export function useColorPack(pack: UnthemeColorPack) {
  return packs[pack];
}
