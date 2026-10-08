import type { Options, Theme, Untheme } from "untheme";
import type { Selection } from "./types";

import { makeUntheme } from "untheme";

import { mockInput } from "./input";

/**
 * Boots a runtime service over a theme. The theme is the base of the service.
 * The container holds an empty patch and the selection. Each modifier is at
 * its first context unless the selection pins another. Each call returns an
 * independent service.
 *
 * @param theme - The theme to boot, usually from {@link mockTheme}.
 * @param selection - The contexts to pin.
 * @param options - The read and write middleware of the container.
 */
export const bootUntheme = <T extends Theme<T>>(
  theme: T,
  selection: Selection<T> = {},
  options: Options<T> = {},
): Untheme<T> => {
  return makeUntheme<T>(
    theme,
    { patch: {}, input: mockInput(theme, selection) },
    options,
  );
};
