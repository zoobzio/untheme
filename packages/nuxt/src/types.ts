import type { Theme, ColorMode } from "untheme";
import type { M2Theme } from "@untheme/material-2/themes";
import type { M3Theme } from "@untheme/material-3/themes";

import { presets } from "./preset";

export type PresetMatrix = {
  m2: M2Theme;
  m3: M3Theme;
};

export type Presets = typeof presets;

export type PresetKey = keyof Presets & keyof PresetMatrix;

export type PresetTheme<P extends PresetKey> = keyof Presets[P];

export type PresetRef<P extends PresetKey> = keyof PresetMatrix[P]["reference"];
export type PresetSys<P extends PresetKey> =
  keyof PresetMatrix[P]["modes"]["dark"];

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
