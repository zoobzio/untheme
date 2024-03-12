import packs from "./packs";
import { ColorPack } from "./types";

export function useColorPack(pack: ColorPack) {
    return packs[pack];
}