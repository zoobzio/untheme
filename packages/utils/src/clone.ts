import type { Template } from "@untheme/schema";

import { copy, remap } from "objectively";

/**
 * A detached plain copy of a theme: every facet rebuilt through {@link copy},
 * landing on the theme's own type through `remap` rather than a whole-theme
 * equality pass over the source.
 */
export const clone = <T extends Template>(theme: T): T => {
  return remap<T, T>(theme, (facet) => copy(facet));
};
