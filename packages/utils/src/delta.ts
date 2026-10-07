import { copy, entries, equals } from "objectively";

/**
 * Returns the entries of `to` that differ from `from`. An entry differs when
 * its value and the value of the same key in `from` differ at any depth.
 * The result holds copies of the values. Two objects with equal values give an
 * empty result.
 */
export const delta = <T extends object>(from: T, to: T): Partial<T> => {
  const result: Partial<T> = {};
  for (const [key, value] of entries(to)) {
    if (!equals(from[key], value)) {
      result[key] = copy(value);
    }
  }
  return result;
};
