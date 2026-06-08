import type { Theme } from "@untheme/core";

/** Recursively makes all properties of `T` optional. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** A theme configuration preset mapping reference and system tokens. */
export type Preset<Ref extends string, Sys extends string> = Omit<
  Theme<Ref, Sys, string>,
  "roles"
>;

/** Factory signature for {@link defineUnthemePreset}. */
export interface PresetFactory {
  <Ref extends string, Sys extends string>(
    preset: Preset<Ref, Sys>,
  ): (
    theme: DeepPartial<Omit<Preset<Ref, Sys>, "base">> & {
      key: string;
      label: string;
    },
  ) => Preset<Ref, Sys>;
}
