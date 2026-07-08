import { describe, expect, it } from "vitest";

import { delta } from "../src/delta";

describe("delta", () => {
  it("emits every key whose value deviates", () => {
    const from = { a: 1, b: "x", c: true };
    const to = { a: 2, b: "x", c: false };
    expect(delta(from, to)).toEqual({ a: 2, c: false });
  });

  it("treats structurally equal values as unchanged", () => {
    const from = { color: { colorSpace: "srgb", components: [0, 0, 1] } };
    const to = { color: { colorSpace: "srgb", components: [0, 0, 1] } };
    expect(delta(from, to)).toEqual({});
  });

  it("yields an empty result for identical objects", () => {
    const shared = { a: 1, b: [1, 2] };
    expect(delta(shared, shared)).toEqual({});
  });

  it("emits copies detached from the source", () => {
    const from = { shadow: { blur: { value: 2, unit: "px" } } };
    const to = { shadow: { blur: { value: 4, unit: "px" } } };
    const result = delta(from, to);
    expect(result.shadow).toEqual(to.shadow);
    expect(result.shadow).not.toBe(to.shadow);
  });

  it("emits a key present only in to", () => {
    const from: Partial<Record<"a" | "b", number>> = { a: 1 };
    const to: Partial<Record<"a" | "b", number>> = { a: 1, b: 2 };
    expect(delta(from, to)).toEqual({ b: 2 });
  });
});
