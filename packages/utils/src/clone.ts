import type { Template } from "@untheme/schema";

import { copy, remap } from "objectively";

/**
 * Makes a deep copy of a theme. The function copies each facet of the theme
 * with {@link copy}. The result has the type of the theme.
 */
export const clone = <T extends Template>(theme: T): T => {
  return remap<T, T>(theme, (facet) => copy(facet));
};
