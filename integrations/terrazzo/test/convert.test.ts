import type { Source } from "../src/types";

import { describe, expect, it } from "vitest";

import { binding, collisions, definition, literal } from "../src/convert";

const token = (over: Partial<Source>): Source => {
  return { id: "test.token", $type: "color", $value: "#000000", ...over };
};

describe("binding", () => {
  it("reconstructs a whole-token alias from the authored value", () => {
    const source = token({
      $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 1 },
      originalValue: { $value: "{color.primary.600}" },
      aliasOf: "color.primary.900",
    });
    expect(binding(source)).toBe("{color.primary.600}");
  });

  it("falls back to the final alias target when the authored value is gone", () => {
    const source = token({
      $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 1 },
      aliasOf: "color.primary.600",
    });
    expect(binding(source)).toBe("{color.primary.600}");
  });

  it("keeps an unresolved alias string in place", () => {
    const source = token({ $value: "{color.primary.600}" });
    expect(binding(source)).toBe("{color.primary.600}");
  });

  it("restores partial aliases inside composite values", () => {
    const source = token({
      $type: "border",
      $value: {
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 1 },
        width: { value: 1, unit: "px" },
        style: "solid",
      },
      partialAliasOf: { color: "color.primary.600", width: "size.sm" },
    });
    expect(binding(source)).toEqual({
      color: "{color.primary.600}",
      width: "{size.sm}",
      style: "solid",
    });
  });

  it("converts null color components to the none sentinel", () => {
    const source = token({
      $value: { colorSpace: "hsl", components: [null, 0.5, 0.5], alpha: 1 },
    });
    expect(binding(source)).toEqual({
      colorSpace: "hsl",
      components: ["none", 0.5, 0.5],
      alpha: 1,
    });
  });

  it("drops a false inset and rejects a true one", () => {
    const shadow = {
      color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.4 },
      offsetX: { value: 0, unit: "px" },
      offsetY: { value: 2, unit: "px" },
      blur: { value: 4, unit: "px" },
      spread: { value: 0, unit: "px" },
    };
    const flat = token({
      $type: "shadow",
      $value: [{ ...shadow, inset: false }],
    });
    expect(binding(flat)).toEqual([shadow]);
    const inset = token({
      $type: "shadow",
      $value: [{ ...shadow, inset: true }],
    });
    expect(() => binding(inset)).toThrow(/inset/);
  });

  it("rejects off-spec token types by name and source", () => {
    const source = token({
      $type: "boolean",
      $value: true,
      id: "feature.enabled",
      source: { filename: "file:///tokens.json" },
    });
    expect(() => binding(source)).toThrow(
      /"boolean".*"feature\.enabled".*tokens\.json/,
    );
  });
});

describe("definition", () => {
  it("carries the declared type, binding, and present metadata", () => {
    const source = token({
      $description: "The brand color.",
      $deprecated: "Use color.primary instead.",
      $extensions: { "com.example": true },
    });
    expect(definition(source)).toEqual({
      $type: "color",
      $value: "#000000",
      $description: "The brand color.",
      $deprecated: "Use color.primary instead.",
      $extensions: { "com.example": true },
    });
  });

  it("omits metadata members that are absent", () => {
    expect(definition(token({}))).toEqual({
      $type: "color",
      $value: "#000000",
    });
  });
});

describe("literal", () => {
  it("converts structurally without reconstructing aliases", () => {
    const source = token({
      $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 1 },
      originalValue: { $value: "{color.primary.600}" },
      aliasOf: "color.primary.600",
    });
    expect(literal(source)).toEqual({
      colorSpace: "srgb",
      components: [0, 0, 0],
      alpha: 1,
    });
  });
});

describe("collisions", () => {
  it("rejects names that dash to the same custom property", () => {
    expect(() => collisions(["color.primary", "color-primary"])).toThrow(
      /--color-primary/,
    );
  });

  it("accepts distinct names", () => {
    expect(() =>
      collisions(["color.primary", "color.secondary"]),
    ).not.toThrow();
  });
});
