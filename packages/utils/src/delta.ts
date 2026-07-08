import { entries, isEqual } from "@untheme/common";

import { copy } from "./copy";

/**
 * The entries of `to` that deviate from `from`: every key `to` holds whose
 * value is not structurally equal to the one `from` holds. Emitted values are
 * copies, so the result shares no structure with `to`. Keys with structurally
 * equal values drop out; two objects that bind identically yield an empty
 * result.
 */
export const delta = <T extends object>(from: T, to: T): Partial<T> => {
  const result: Partial<T> = {};
  for (const [key, value] of entries(to)) {
    if (!isEqual(from[key], value)) {
      result[key] = copy(value);
    }
  }
  return result;
};
