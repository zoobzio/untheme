import { equals, record } from "objectively";

/**
 * Rebuilds a value into fresh containers: arrays and plain records are
 * reconstructed member by member, and everything else — primitives, functions,
 * class instances — passes through by reference. Carries no verification of
 * its own; {@link copy} proves the whole rebuild against the source in one
 * deep comparison at the root.
 */
const rebuild = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => rebuild(entry));
  }

  if (record(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = rebuild(value[key]);
    }
    return result;
  }

  return value;
};

/**
 * Deep copy of plain data: records and arrays are rebuilt from fresh
 * containers, so mutating the copy never reaches the source. Every value is
 * reached through plain property access, so copying a reactive proxy yields an
 * inert, plain snapshot detached from the proxy.
 *
 * Non-plain values — functions and class instances, such as those a token's
 * `$extensions` may carry — pass through by reference rather than being
 * duplicated. `structuredClone` is never used: it throws on functions and
 * detaches proxies through a mechanism this copy deliberately avoids.
 *
 * The rebuild is proven against the source once, at the root: the comparison
 * is deep, so loss at any depth surfaces here, and the guard is what narrows
 * the rebuilt structure back to the source's type.
 */
export const copy = <T>(value: T): T => {
  const result = rebuild(value);

  if (!equals(value, result)) {
    throw new TypeError("could not copy value");
  }

  return result;
};
