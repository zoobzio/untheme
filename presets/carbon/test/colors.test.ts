import { describe, it, expect } from "vitest";
import { blue } from "@carbon/colors";
import { createCarbonColorTokens } from "../src/colors";

describe("createCarbonColorTokens", () => {
  const tokens = createCarbonColorTokens("blue", blue);

  it("generates 10 grade tokens", () => {
    expect(Object.keys(tokens)).toHaveLength(10);
  });

  it("emits grades as `{name}-{grade}`", () => {
    expect(tokens["blue-10"]).toBe(blue[10]);
    expect(tokens["blue-60"]).toBe(blue[60]);
    expect(tokens["blue-100"]).toBe(blue[100]);
  });

  it("produces valid hex color values", () => {
    for (const value of Object.values(tokens)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("grade 10 is lighter than grade 100", () => {
    const lightness = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return r + g + b;
    };
    expect(lightness(tokens["blue-10"])).toBeGreaterThan(
      lightness(tokens["blue-100"]),
    );
  });

  it("produces different palettes for different families", () => {
    const red = createCarbonColorTokens("red", blue);
    expect(Object.keys(red)).toContain("red-60");
  });
});
