import type { Input, Layer, Template } from "untheme";
import type { NuxtUnthemeConfig } from "./config";

/**
 * What one Nuxt layer may author under its `untheme` key: any subset of the
 * config. A layer authoring a `theme` authors it complete — themes are
 * composed where they are built, through a preset (`preset.configure`,
 * `preset.define`, `extend`), never by the config merge.
 */
export type UnthemeLayerConfig = Partial<NuxtUnthemeConfig>;

/**
 * Resolves the untheme configs authored across Nuxt layers into one config,
 * standing in for Nuxt's own layer merge, whose array concatenation corrupts
 * array-valued bindings (shadow lists, gradient stops, `cubicBezier` tuples,
 * color components, font stacks) and duplicates `order`.
 *
 * Resolution is per member, the closest layer winning. `theme` replaces
 * whole: every authored theme is complete, and merging two would only
 * corrupt them — augmenting a deeper layer's theme belongs at the authoring
 * site, through the preset that built it. `input` resolves per modifier and
 * `themes` per catalog key, a shared key replacing the deeper layer's entry
 * whole.
 *
 * @param configs - The per-layer untheme configs, closest layer first.
 * @returns The resolved config; members no layer authored stay undefined.
 */
export const resolveUnthemeConfig = (
  configs: UnthemeLayerConfig[],
): Partial<NuxtUnthemeConfig> => {
  const ordered = [...configs].reverse();

  const inputs = ordered
    .map((config) => config.input)
    .filter((input) => input !== undefined);
  const themes = ordered
    .map((config) => config.themes)
    .filter((catalog) => catalog !== undefined);

  return {
    theme: configs.find((config) => config.theme !== undefined)?.theme,
    input:
      inputs.length > 0
        ? (Object.assign({}, ...inputs) as Input<Template>)
        : undefined,
    themes:
      themes.length > 0
        ? (Object.assign({}, ...themes) as Record<string, Layer<Template>>)
        : undefined,
  };
};
