import type { PresetFactory } from "./types";

/**
 * Creates a theme factory from a base {@link Preset}.
 *
 * @param base - The base config that defines the token structure and default values.
 * @returns A theme factory that accepts deep-partial overrides and returns a fully resolved {@link Preset}.
 */
export const defineUnthemePreset: PresetFactory = (preset) => (theme) => {
  return {
    preset: preset.preset,
    key: theme.key,
    label: theme.label,
    reference: {
      ...preset.reference,
      ...(theme.reference ?? {}),
    },
    modes: {
      light: {
        ...preset.modes.light,
        ...(theme.modes?.light ?? {}),
      },
      dark: {
        ...preset.modes.dark,
        ...(theme.modes?.dark ?? {}),
      },
    },
  };
};
