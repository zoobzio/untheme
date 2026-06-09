import { describe, it, expect } from "vitest";
import { createM3ColorTokens } from "../src/colors";
import { M3_TONES } from "../src/constant";

describe("createM3ColorTokens", () => {
  const tokens = createM3ColorTokens("blue", "#0000FF");

  it("generates 26 tone stops", () => {
    expect(Object.keys(tokens)).toHaveLength(26);
  });

  it("prefixes keys with the given name", () => {
    for (const key of Object.keys(tokens)) {
      expect(key).toMatch(/^blue-\d+$/);
    }
  });

  it("produces valid hex color values", () => {
    for (const value of Object.values(tokens)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("tone 0 is black", () => {
    expect(tokens["blue-0"]).toBe("#000000");
  });

  it("tone 100 is white", () => {
    expect(tokens["blue-100"]).toBe("#ffffff");
  });

  it("produces different palettes for different inputs", () => {
    const red = createM3ColorTokens("red", "#FF0000");
    expect(red["red-40"]).not.toBe(tokens["blue-40"]);
  });

  it("increases lightness monotonically as tone rises", () => {
    // Higher tone stops must map to lighter colors across the whole range,
    // not just the 0/100 extremes.
    const lightness = (hex: string) =>
      parseInt(hex.slice(1, 3), 16) +
      parseInt(hex.slice(3, 5), 16) +
      parseInt(hex.slice(5, 7), 16);
    const ascending = [...M3_TONES].sort((a, b) => a - b);
    for (let i = 1; i < ascending.length; i++) {
      const prev = lightness(tokens[`blue-${ascending[i - 1]}`]);
      const curr = lightness(tokens[`blue-${ascending[i]}`]);
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it("throws on an empty hex value", () => {
    expect(() => createM3ColorTokens("x", "")).toThrow();
  });
});
