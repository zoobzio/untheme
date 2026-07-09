import { describe, it, expect } from "vitest";

import { copy } from "../src/copy";

describe("copy", () => {
  it("returns primitives unchanged", () => {
    expect(copy(5)).toBe(5);
    expect(copy("x")).toBe("x");
    expect(copy(true)).toBe(true);
    expect(copy(null)).toBe(null);
    expect(copy(undefined)).toBe(undefined);
  });

  it("rebuilds nested records so mutation does not reach the source", () => {
    const source = { a: { b: { c: 1 } } };
    const result = copy(source);

    expect(result).toEqual(source);
    expect(result).not.toBe(source);
    expect(result.a).not.toBe(source.a);
    expect(result.a.b).not.toBe(source.a.b);

    result.a.b.c = 2;
    expect(source.a.b.c).toBe(1);
  });

  it("rebuilds arrays and nested arrays", () => {
    const source = { list: [1, [2, 3], { k: 4 }] };
    const result = copy(source);

    expect(result).toEqual(source);
    expect(result.list).not.toBe(source.list);
    expect(result.list[1]).not.toBe(source.list[1]);
    expect(result.list[2]).not.toBe(source.list[2]);
  });

  it("preserves none sentinels and distinguishes null from undefined", () => {
    const source = { components: [0, "none", 1], a: null, b: undefined };
    const result = copy(source);

    expect(result).toEqual(source);
    expect(result.components).toEqual([0, "none", 1]);
    expect(result.a).toBeNull();
    expect("b" in result).toBe(true);
    expect(result.b).toBeUndefined();
  });

  it("copies structures containing NaN without throwing", () => {
    const source = { a: NaN, list: [NaN, 1], nested: { b: NaN } };
    const result = copy(source);

    expect(result).not.toBe(source);
    expect(result.a).toBeNaN();
    expect(result.list).toEqual([NaN, 1]);
    expect(result.nested.b).toBeNaN();
  });

  it("passes functions and class instances through by reference", () => {
    const fn = () => 1;
    class Box {
      constructor(public value: number) {}
    }
    const box = new Box(1);
    const source = { fn, box };
    const result = copy(source);

    expect(result.fn).toBe(fn);
    expect(result.box).toBe(box);
  });

  it("detaches a reactive-style proxy into a plain object", () => {
    const target = { a: 1, nested: { b: 2 } };
    const proxy = new Proxy(target, {
      get(t, key, receiver) {
        return Reflect.get(t, key, receiver);
      },
    });

    const result = copy(proxy);

    /* The snapshot is a plain object, not the proxy nor its target. */
    expect(result).not.toBe(proxy);
    expect(result).not.toBe(target);
    expect(result.nested).not.toBe(target.nested);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(result).toEqual({ a: 1, nested: { b: 2 } });

    /* Mutating the snapshot reaches neither the proxy nor its target. */
    result.nested.b = 99;
    expect(target.nested.b).toBe(2);
  });
});
