import { describe, expect, it } from "vitest";

import {
  isDefinition,
  isEqual,
  isObject,
  isRecord,
  isReference,
} from "../src/guard";

describe("isRecord", () => {
  it("accepts a plain object", () => {
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it("accepts a null-prototype object", () => {
    expect(isRecord(Object.create(null))).toBe(true);
  });

  it("accepts a proxy over a plain object", () => {
    expect(isRecord(new Proxy({ a: 1 }, {}))).toBe(true);
  });

  it("rejects null and undefined", () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });

  it("rejects arrays", () => {
    expect(isRecord([1, 2])).toBe(false);
  });

  it("rejects functions", () => {
    expect(isRecord(() => {})).toBe(false);
  });

  it("rejects class instances", () => {
    expect(isRecord(new Date())).toBe(false);
    expect(isRecord(new (class {})())).toBe(false);
  });

  it("rejects primitives", () => {
    expect(isRecord("a")).toBe(false);
    expect(isRecord(4)).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});

describe("isObject", () => {
  it("accepts a plain object", () => {
    expect(isObject({ a: 1 })).toBe(true);
  });

  it("accepts a class instance, unlike isRecord", () => {
    expect(isObject(new Date())).toBe(true);
    expect(isObject(new (class {})())).toBe(true);
  });

  it("rejects null and undefined", () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });

  it("rejects arrays", () => {
    expect(isObject([1, 2])).toBe(false);
  });

  it("rejects functions", () => {
    expect(isObject(() => {})).toBe(false);
  });

  it("rejects primitives", () => {
    expect(isObject("a")).toBe(false);
    expect(isObject(4)).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});

describe("isReference", () => {
  it("accepts a curly-brace reference", () => {
    expect(isReference("{color.bg}")).toBe(true);
  });

  it("accepts empty braces — the shape alone is tested", () => {
    expect(isReference("{}")).toBe(true);
  });

  it("rejects a bare string", () => {
    expect(isReference("color.bg")).toBe(false);
  });

  it("rejects a partially braced string", () => {
    expect(isReference("{color.bg")).toBe(false);
    expect(isReference("color.bg}")).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(isReference(4)).toBe(false);
    expect(isReference({ value: "{color.bg}" })).toBe(false);
    expect(isReference(null)).toBe(false);
  });
});

describe("isDefinition", () => {
  it("accepts an object carrying $value", () => {
    expect(isDefinition({ $type: "color", $value: "{color.fg}" })).toBe(true);
    expect(isDefinition({ $value: 4 })).toBe(true);
  });

  it("rejects bare bindings", () => {
    expect(isDefinition("{color.fg}")).toBe(false);
    expect(isDefinition({ colorSpace: "srgb", components: [0, 0, 1] })).toBe(
      false,
    );
    expect(isDefinition({ value: 4, unit: "px" })).toBe(false);
  });

  it("rejects arrays, null, and primitives", () => {
    expect(isDefinition([{ $value: 1 }])).toBe(false);
    expect(isDefinition(null)).toBe(false);
    expect(isDefinition(4)).toBe(false);
  });
});

describe("isEqual", () => {
  it("compares primitives by value", () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
    expect(isEqual("x", "x")).toBe(true);
    expect(isEqual("x", "y")).toBe(false);
    expect(isEqual(true, true)).toBe(true);
  });

  it("treats null and undefined as distinct", () => {
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(undefined, undefined)).toBe(true);
    expect(isEqual(null, undefined)).toBe(false);
  });

  it("reports NaN as equal to itself, and only to itself", () => {
    expect(isEqual(NaN, NaN)).toBe(true);
    expect(isEqual(NaN, 0)).toBe(false);
    expect(isEqual(0, NaN)).toBe(false);
    expect(isEqual({ a: NaN }, { a: NaN })).toBe(true);
    expect(isEqual([NaN], [NaN])).toBe(true);
  });

  it("compares records key by key", () => {
    expect(isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false);
  });

  it("counts keys on both sides", () => {
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(isEqual({ a: 1, b: undefined }, { a: 1 })).toBe(false);
  });

  it("compares arrays element by element", () => {
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(isEqual([[1], [2]], [[1], [2]])).toBe(true);
  });

  it("matches none sentinels inside component arrays", () => {
    expect(isEqual([0, "none", 1], [0, "none", 1])).toBe(true);
    expect(isEqual([0, "none", 1], [0, 0, 1])).toBe(false);
  });

  it("distinguishes an array from a record", () => {
    expect(isEqual([], {})).toBe(false);
  });

  it("compares non-plain values by identity", () => {
    const fn = () => 1;
    expect(isEqual(fn, fn)).toBe(true);
    expect(isEqual(fn, () => 1)).toBe(false);

    class Box {
      constructor(public value: number) {}
    }
    const box = new Box(1);
    expect(isEqual(box, box)).toBe(true);
    expect(isEqual(new Box(1), new Box(1))).toBe(false);
  });

  it("narrows the compared value to the reference's type", () => {
    const reference: { value: number } = { value: 4 };
    const candidate: unknown = { value: 4 };
    if (isEqual(reference, candidate)) {
      const narrowed: { value: number } = candidate;
      expect(narrowed.value).toBe(4);
    }
  });
});
