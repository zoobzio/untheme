import type { Template, Theme } from "@untheme/schema";
import type { Diff } from "./types";

import { map } from "objectively";
import { delta } from "./delta";
import { traverse } from "./traverse";

/**
 * Makes the patch that turns `from` into `to`. The patch holds each binding of
 * `to` that differs from `from`, for each token and for each context. For a
 * token, the function compares and returns the `$value`. The function ignores
 * the identity and the order. Empty maps mean that the themes have the same
 * bindings. `merge` applies the patch to `from`. The patch holds added and
 * changed bindings only.
 */
export const diff = <T extends Template>(
  from: Theme<T>,
  to: Theme<T>,
): Diff<T> => {
  const tokens = delta(
    map(from.tokens, (slot) => slot.$value),
    map(to.tokens, (slot) => slot.$value),
  );

  const modifiers = traverse(to.modifiers, (overrides, at) =>
    delta(at(from.modifiers) ?? {}, overrides),
  );

  return { tokens, modifiers };
};
