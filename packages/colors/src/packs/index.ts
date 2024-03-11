import tailwind from "./tailwind";

const packs = {
    tailwind
}

export type ColorPack = keyof typeof packs;

export default packs;