import { describe, it, expect } from "vitest";
import { createM2ColorTokens } from "../src/colors";

describe("createM2ColorTokens", () => {
  const tokens = createM2ColorTokens("blue", "#0000FF");

  it("generates 14 shade stops", () => {
    expect(Object.keys(tokens)).toHaveLength(14);
  });

  it("prefixes standard shade keys with the given name", () => {
    const standard = Object.keys(tokens).filter((k) => /^blue-\d+$/.test(k));
    expect(standard).toHaveLength(10);
  });

  it("prefixes accent shade keys with the given name", () => {
    const accents = Object.keys(tokens).filter((k) => /^blue-A\d+$/.test(k));
    expect(accents).toHaveLength(4);
  });

  it("produces valid hex color values", () => {
    for (const value of Object.values(tokens)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("shade 50 is lighter than shade 900", () => {
    const lightness = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return r + g + b;
    };
    expect(lightness(tokens["blue-50"])).toBeGreaterThan(
      lightness(tokens["blue-900"]),
    );
  });

  it("produces different palettes for different inputs", () => {
    const red = createM2ColorTokens("red", "#FF0000");
    expect(red["red-500"]).not.toBe(tokens["blue-500"]);
  });

  it("throws on an empty hex value", () => {
    expect(() => createM2ColorTokens("x", "")).toThrow();
  });
});
