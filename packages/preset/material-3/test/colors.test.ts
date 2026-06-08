import { describe, it, expect } from "vitest";
import { createM3ColorTokens } from "../src/colors";

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
});
