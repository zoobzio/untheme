import type { Theme, ColorMode } from "untheme";
import type { M2Theme } from "@untheme/material-2/themes";
import type { M3Theme } from "@untheme/material-3/themes";

import { presets } from "./preset";

/** Maps each preset key to the theme shape it produces. */
export type PresetMatrix = {
  m2: M2Theme;
  m3: M3Theme;
};

/** The shape of the {@link presets} registry. */
export type Presets = typeof presets;

/** A valid preset key (e.g. `"m2"` | `"m3"`). */
export type PresetKey = keyof Presets & keyof PresetMatrix;

/** Union of the built-in theme keys available for a given preset. */
export type PresetTheme<P extends PresetKey> = keyof Presets[P];

/** Union of reference token names defined by a given preset. */
export type PresetRef<P extends PresetKey> = keyof PresetMatrix[P]["reference"];
/** Union of system token names defined by a given preset. */
export type PresetSys<P extends PresetKey> =
  keyof PresetMatrix[P]["modes"]["dark"];

/**
 * Strongly-typed user configuration: picking a `preset` and `theme` infers the
 * available reference and system token names for the `extend` overrides.
 */
export interface UserUnthemeConfig<
  P extends PresetKey,
  Ref extends string,
  Sys extends string,
  Role extends string,
> {
  preset: P;
  theme: keyof PresetTheme<P>;
  extend: {
    reference?: { [K in Ref]: string } & {
      [K in PresetRef<P>]?: string;
    };
    modes?: {
      [M in ColorMode]: { [K in Sys]: NoInfer<Ref | PresetRef<P>> } & {
        [K in PresetSys<P>]?: NoInfer<Ref | PresetRef<P>>;
      };
    };
    roles?: {
      [K in Role]: NoInfer<Ref | Sys | PresetRef<P> | PresetSys<P>>;
    };
  };
}

/** Configuration options for the untheme Nuxt module. */
export interface NuxtUnthemeConfig {
  preset: PresetKey;
  theme: string;
  extend: Partial<Theme<string, string, string>>;
}

/** Factory signature for {@link defineUnthemeConfig}. */
export interface NuxtUnthemeConfigFactory {
  <
    P extends PresetKey,
    Ref extends string,
    Sys extends string,
    Role extends string,
  >(
    config: UserUnthemeConfig<P, Ref, Sys, Role>,
  ): UserUnthemeConfig<P, Ref, Sys, Role>;
}
