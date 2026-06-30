import { describe, it, expect } from "vitest";
import preset from "../src/preset";
import { CARBON_COLORS } from "../src/constant";

// The base theme the preset ships as its default, taken from a ready config.
const base = preset.use({ color: "light" }).theme;

describe("Carbon preset", () => {
  it("ships the base scheme pairing White with Gray 100", () => {
    expect(base.id).toBe("white-g100");
    expect(base.name).toBe("Carbon");
  });

  it("includes all 12 families as 10-grade palettes", () => {
    for (const family of CARBON_COLORS) {
      expect(base.tokens[`${family}-10`]).toMatch(/^#/);
      expect(base.tokens[`${family}-100`]).toMatch(/^#/);
    }
  });

  it("includes pure tone tokens", () => {
    expect(base.tokens["white"]).toBe("#ffffff");
    expect(base.tokens["black"]).toBe("#000000");
  });

  it("matches known Carbon palette values", () => {
    expect(base.tokens["blue-60"]).toBe("#0f62fe");
    expect(base.tokens["red-60"]).toBe("#da1e28");
    expect(base.tokens["cool-gray-80"]).toBe("#343a3f");
  });

  it("includes typography tokens", () => {
    expect(base.tokens["font-sans"]).toContain("IBM Plex Sans");
    expect(base.tokens["font-mono"]).toContain("IBM Plex Mono");
    expect(base.tokens["body-01-size"]).toBe("0.875rem");
    expect(base.tokens["heading-07-weight"]).toBe("300");
  });

  it("includes spacing tokens", () => {
    expect(base.tokens["spacing-01"]).toBe("0.125rem");
    expect(base.tokens["spacing-13"]).toBe("10rem");
  });

  it("includes motion tokens", () => {
    expect(base.tokens["duration-fast-01"]).toBe("70ms");
    expect(base.tokens["easing-standard"]).toContain("cubic-bezier");
  });

  it("declares a single color modifier with light and dark contexts", () => {
    expect(base.order).toEqual(["color"]);
    expect(Object.keys(base.modifiers.color)).toEqual(["light", "dark"]);
  });

  it("leaves the light context empty — the base tokens are the light scheme", () => {
    expect(base.modifiers.color.light).toEqual({});
  });

  it("binds the semantic roles to the White (light) scheme in the base", () => {
    expect(base.tokens["background"]).toBe("{white}");
    expect(base.tokens["text-primary"]).toBe("{gray-100}");
    expect(base.tokens["support-error"]).toBe("{red-60}");
    expect(base.tokens["focus"]).toBe("{blue-60}");
  });

  it("remaps the semantic roles onto Gray 100 in the dark context", () => {
    expect(base.modifiers.color.dark["background"]).toBe("{gray-100}");
    expect(base.modifiers.color.dark["text-primary"]).toBe("{gray-10}");
    expect(base.modifiers.color.dark["support-error"]).toBe("{red-50}");
    expect(base.modifiers.color.dark["focus"]).toBe("{white}");
  });

  it("has 31 semantic roles in the dark context", () => {
    expect(Object.keys(base.modifiers.color.dark)).toHaveLength(31);
  });

  it("references only real palette tokens from every dark-context role", () => {
    const tokenKeys = new Set(Object.keys(base.tokens));
    for (const ref of Object.values(base.modifiers.color.dark)) {
      expect(tokenKeys.has(ref.slice(1, -1))).toBe(true);
    }
  });

  it("returns the requested selection from use()", () => {
    expect(preset.use({ color: "light" }).input).toEqual({ color: "light" });
    expect(preset.use({ color: "dark" }).input).toEqual({ color: "dark" });
  });

  it("resolves variant overrides over the base", () => {
    const theme = preset.define({
      id: "override",
      name: "Override",
      tokens: { "blue-60": "#ff0000" },
    });
    expect(theme.id).toBe("override");
    expect(theme.tokens["blue-60"]).toBe("#ff0000");
    expect(theme.tokens["blue-10"]).toBe(base.tokens["blue-10"]);
  });
});
