import { describe, it, expect } from "vitest";
import { blue, blueDark } from "@radix-ui/colors";
import { createRadixColorTokens } from "../src/colors";

describe("createRadixColorTokens", () => {
  const tokens = createRadixColorTokens("blue", blue, blueDark);

  it("generates 24 tokens (12 light + 12 dark steps)", () => {
    expect(Object.keys(tokens)).toHaveLength(24);
  });

  it("emits light steps as `{name}-{step}`", () => {
    expect(tokens["blue-1"]).toBe(blue.blue1);
    expect(tokens["blue-9"]).toBe(blue.blue9);
    expect(tokens["blue-12"]).toBe(blue.blue12);
  });

  it("emits dark steps as `{name}-dark-{step}`", () => {
    expect(tokens["blue-dark-1"]).toBe(blueDark.blue1);
    expect(tokens["blue-dark-9"]).toBe(blueDark.blue9);
    expect(tokens["blue-dark-12"]).toBe(blueDark.blue12);
  });

  it("produces valid hex color values", () => {
    for (const value of Object.values(tokens)) {
      expect(value).toMatch(/^#[0-9a-f]{3,8}$/);
    }
  });

  it("light and dark step 1 differ", () => {
    expect(tokens["blue-1"]).not.toBe(tokens["blue-dark-1"]);
  });
});
