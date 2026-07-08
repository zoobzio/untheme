import type { Template, Theme } from "@untheme/schema";
import type { Diff } from "./types";

import { map } from "@untheme/common";
import { delta } from "./delta";
import { traverse } from "./traverse";

/**
 * Computes the patch that turns `from` into `to`: every binding `to` holds that
 * deviates from `from`, token by token and context by context. At the token
 * level the bound `$value` is compared and emitted — a token's metadata cannot
 * drift through the patch pipeline, so only the binding is carried. Identity and
 * order are not compared. Empty maps mean the themes bind identically; applying
 * the result to `from` via `merge` restores `to` value-wise.
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
