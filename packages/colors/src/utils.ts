import packs, { type ColorPack } from "./packs";

export function useColorPack(pack: ColorPack) {
    return packs[pack];
}