import type { Options, Theme, Untheme } from "untheme";
import type { Selection } from "./types";

import { clone, makeUntheme } from "untheme";

import { mockInput } from "./input";

/**
 * Boots a runtime service over a theme. The container holds a detached clone
 * of the theme, the selection, and an empty override. Each modifier is at its
 * first context unless the selection pins another. Every call returns an
 * independent service, so the swaps and edits of one test do not reach
 * another test.
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
    {
      theme: clone(theme),
      input: mockInput(theme, selection),
      override: {},
    },
    options,
  );
};
