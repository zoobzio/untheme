import { describe, expect, it } from "vitest";

import { anchor, extend } from "../src/tailor";
import { FIXTURES } from "./helpers";

describe("extend", () => {
  it("merges objects key by key and adds the keys the document lacks", () => {
    const document = { sets: { a: { sources: [1] } }, name: "A" };
    const result = extend(document, { sets: { b: { sources: [2] } } });
    expect(result).toEqual({
      sets: { a: { sources: [1] }, b: { sources: [2] } },
      name: "A",
    });
  });

  it("concatenates arrays, the document first", () => {
    const result = extend({ sources: [1, 2] }, { sources: [3] });
    expect(result).toEqual({ sources: [1, 2, 3] });
  });

  it("replaces a scalar", () => {
    expect(extend({ default: "light" }, { default: "dark" })).toEqual({
      default: "dark",
    });
  });

  it("replaces when the kinds differ", () => {
    expect(extend({ a: [1] }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
    expect(extend({ a: { b: 1 } }, { a: "x" })).toEqual({ a: "x" });
  });

  it("leaves both inputs as they are", () => {
    const document = { sets: { a: { sources: [1] } } };
    const fragment = { sets: { a: { sources: [2] } } };
    extend(document, fragment);
    expect(document).toEqual({ sets: { a: { sources: [1] } } });
    expect(fragment).toEqual({ sets: { a: { sources: [2] } } });
  });

  it("ignores inherited keys of the document", () => {
    const document: Record<string, unknown> = Object.create({ toString: 1 });
    const result = extend(document, { toString: { a: 1 } });
    expect(result).toEqual({ toString: { a: 1 } });
  });
});

describe("anchor", () => {
  it("resolves a relative $ref from the base and keeps the rest", () => {
    const result = anchor(
      {
        sets: { a: { sources: [{ $ref: "./a.json" }, { $ref: "b.json#/x" }] } },
        resolutionOrder: [{ $ref: "#/sets/a" }],
        default: "light",
      },
      FIXTURES,
    );
    expect(result).toEqual({
      sets: {
        a: {
          sources: [
            { $ref: new URL("a.json", FIXTURES).href },
            { $ref: new URL("b.json#/x", FIXTURES).href },
          ],
        },
      },
      resolutionOrder: [{ $ref: "#/sets/a" }],
      default: "light",
    });
  });

  it("keeps an absolute $ref", () => {
    const refs = [
      "npm:/@untheme/aurora/src/themes/nord.json",
      "https://example.com/t.json",
      "file:///tmp/t.json",
    ];
    for (const $ref of refs) {
      expect(anchor({ $ref }, FIXTURES)).toEqual({ $ref });
    }
  });

  it("returns a copy", () => {
    const fragment = { sources: [{ $ref: "./a.json" }] };
    const result = anchor(fragment, FIXTURES) as typeof fragment;
    expect(result).not.toBe(fragment);
    expect(result.sources).not.toBe(fragment.sources);
    expect(fragment.sources[0]?.$ref).toBe("./a.json");
  });
});
