import type { Config } from "./types";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Creates a theme factory from a base {@link Config}.
 *
 * @param base - The base config that defines the token structure and default values.
 * @returns A theme factory that accepts deep-partial overrides and returns a fully resolved {@link Config}.
 */
export const defineUnthemeConfig =
  <Ref extends string, Sys extends string>(base: Config<Ref, Sys>) =>
  (
    theme: DeepPartial<Config<Ref, Sys>> & { label: string },
  ): Config<Ref, Sys> => {
    return {
      label: theme.label,
      reference: {
        ...base.reference,
        ...(theme.reference ?? {}),
      },
      modes: {
        light: {
          ...base.modes.light,
          ...(theme.modes?.light ?? {}),
        },
        dark: {
          ...base.modes.dark,
          ...(theme.modes?.dark ?? {}),
        },
      },
    };
  };
