/**
 * Whether a value is a plain record: a non-null object whose prototype is
 * `Object.prototype` or `null`. Arrays, functions, and class instances fail
 * this test — they carry a different prototype.
 *
 * A reactive proxy over a plain object passes: the proxy forwards its prototype
 * to the wrapped target, so it reads as a plain record and its entries can be
 * walked into an inert snapshot.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * Whether a value is a non-array object: anything indexable by key, class
 * instances included. Looser than {@link isRecord} — use this to gate key-wise
 * traversal or validation, and {@link isRecord} when only plain data may pass,
 * as when rebuilding a structure into a detached copy.
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

/**
 * Whether a value is a reference in curly-brace syntax: a string wrapped in
 * `{` and `}`. A shape test only — whether the name inside belongs to any
 * contract is the caller's concern.
 */
export const isReference = (value: unknown): value is `{${string}}` => {
  return (
    typeof value === "string" && value.startsWith("{") && value.endsWith("}")
  );
};

/**
 * Whether a value is a token definition rather than a bare binding: a
 * non-array object carrying a `$value` member. A bare binding is a reference
 * string or a structured value, neither of which carries `$value` — so the
 * member alone discriminates the two. A shape test only; whether the object is
 * a well-formed definition is the caller's concern.
 */
export const isDefinition = (value: unknown): value is { $value: unknown } => {
  return isObject(value) && "$value" in value;
};

/**
 * Deep structural equality over plain data: records are compared key by key,
 * arrays element by element, and primitives by `===`. Two values are equal when
 * they have the same shape and every leaf matches, which narrows `b` to `a`'s
 * type.
 *
 * Non-plain values — functions and class instances — compare by identity, the
 * same reference-based test `===` applies. `NaN` follows `===` and is never
 * equal to itself; `null` and `undefined` are distinct.
 */
export const isEqual = <T>(a: T, b: unknown): b is T => {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let index = 0; index < a.length; index++) {
      if (!isEqual(a[index], b[index])) {
        return false;
      }
    }
    return true;
  }

  if (isRecord(a) && isRecord(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      if (!isEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
};
