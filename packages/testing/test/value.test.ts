import { describe, expect, it } from "vitest";

import { InvalidSpecError } from "../src/error";
import { binding, color, definition, isReference } from "../src/value";

describe("color", () => {
  it("expands shorthand hex and normalizes the fallback", () => {
    expect(color("#FFF")).toEqual({
      colorSpace: "srgb",
      components: [1, 1, 1],
      hex: "#ffffff",
    });
    expect(color("#3b82f6")).toEqual({
      colorSpace: "srgb",
      components: [0.2314, 0.5098, 0.9647],
      hex: "#3b82f6",
    });
  });

  it("carries alpha when the hex has one short of opaque", () => {
    expect(color("#00000080")).toMatchObject({
      components: [0, 0, 0],
      alpha: 0.502,
      hex: "#000000",
    });
    expect(color("#000f")).not.toHaveProperty("alpha");
    expect(color("#0008")).toMatchObject({ alpha: 0.5333 });
  });
});

describe("isReference", () => {
  it("accepts a braced name and nothing else", () => {
    expect(isReference("{blue}")).toBe(true);
    expect(isReference("{color.blue-500}")).toBe(true);
    expect(isReference("blue")).toBe(false);
    expect(isReference("{}")).toBe(false);
    expect(isReference("{a}{b}")).toBe(false);
    expect(isReference(1)).toBe(false);
  });
});

describe("definition", () => {
  it("returns a reference as is, for the spec to type", () => {
    expect(definition("a", "{b}")).toBe("{b}");
  });

  it("rejects a value that is neither terse nor a definition", () => {
    expect(() => definition("a", { $value: 1 } as never)).toThrow(
      InvalidSpecError,
    );
    expect(() => definition("a", [] as never)).toThrow(InvalidSpecError);
  });
});

describe("binding", () => {
  it("keeps a reference and a structured value, and parses the rest", () => {
    expect(binding("a", "{b}")).toBe("{b}");
    expect(binding("a", { value: 1, unit: "px" })).toEqual({
      value: 1,
      unit: "px",
    });
    expect(binding("a", 4)).toBe(4);
    expect(binding("a", "4px")).toEqual({ value: 4, unit: "px" });
    expect(binding("a", "#000")).toMatchObject({ hex: "#000000" });
  });

  it("rejects a terse string in no recognized form", () => {
    expect(() => binding("a", "bold")).toThrow(InvalidSpecError);
  });
});
