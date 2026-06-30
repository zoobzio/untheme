import { describe, it, expect } from "vitest";
import preset from "../src/preset";
import { RADIX_SCALES } from "../src/constant";

const { theme } = preset.use({ color: "light" });

describe("Radix preset", () => {
  it("ships the base scheme", () => {
    expect(theme.name).toBe("Radix UI");
  });

  it("includes all 31 scales as light and dark 12-step palettes", () => {
    for (const scale of RADIX_SCALES) {
      expect(theme.tokens[`${scale}-1`]).toMatch(/^#/);
      expect(theme.tokens[`${scale}-12`]).toMatch(/^#/);
      expect(theme.tokens[`${scale}-dark-1`]).toMatch(/^#/);
      expect(theme.tokens[`${scale}-dark-12`]).toMatch(/^#/);
    }
  });

  it("light and dark scale values diverge", () => {
    expect(theme.tokens["indigo-1"]).not.toBe(theme.tokens["indigo-dark-1"]);
  });

  it("includes pure tone tokens", () => {
    expect(theme.tokens["white"]).toBe("#ffffff");
    expect(theme.tokens["black"]).toBe("#000000");
  });

  it("includes radius tokens", () => {
    expect(theme.tokens["radius-1"]).toBe("3px");
    expect(theme.tokens["radius-full"]).toBe("9999px");
  });

  it("includes spacing tokens", () => {
    expect(theme.tokens["space-1"]).toBe("4px");
    expect(theme.tokens["space-9"]).toBe("64px");
  });

  it("includes typography tokens", () => {
    expect(theme.tokens["font-sans"]).toContain("sans-serif");
    expect(theme.tokens["font-size-1"]).toBe("12px");
    expect(theme.tokens["line-height-1"]).toBe("16px");
    expect(theme.tokens["letter-spacing-1"]).toBe("0.0025em");
    expect(theme.tokens["weight-regular"]).toBe("400");
  });

  it("includes shadow tokens", () => {
    expect(theme.tokens["shadow-1"]).toContain("inset");
    expect(theme.tokens["shadow-6"]).toContain("rgb(");
  });

  it("declares a single color modifier with light and dark contexts", () => {
    expect(theme.order).toEqual(["color"]);
    expect(Object.keys(theme.modifiers.color)).toEqual(["light", "dark"]);
  });

  it("leaves the light context empty — the base tokens are the light scheme", () => {
    expect(theme.modifiers.color.light).toEqual({});
  });

  it("binds the accent role to indigo in the base (light)", () => {
    expect(theme.tokens["accent-solid"]).toBe("{indigo-9}");
    expect(theme.tokens["accent-text"]).toBe("{indigo-12}");
  });

  it("remaps the accent role onto the dark indigo scale in the dark context", () => {
    expect(theme.modifiers.color.dark["accent-solid"]).toBe("{indigo-dark-9}");
    expect(theme.modifiers.color.dark["accent-text"]).toBe("{indigo-dark-12}");
  });

  it("binds the gray role to slate", () => {
    expect(theme.tokens["gray-app-bg"]).toBe("{slate-1}");
    expect(theme.modifiers.color.dark["gray-app-bg"]).toBe("{slate-dark-1}");
  });

  it("binds status roles to their functional scales", () => {
    expect(theme.tokens["error-solid"]).toBe("{red-9}");
    expect(theme.tokens["success-solid"]).toBe("{green-9}");
    expect(theme.tokens["warning-solid"]).toBe("{amber-9}");
    expect(theme.tokens["info-solid"]).toBe("{blue-9}");
  });

  it("resolves solid contrast to a pure tone", () => {
    expect(theme.tokens["accent-contrast"]).toBe("{white}");
    expect(theme.modifiers.color.dark["accent-contrast"]).toBe("{white}");
  });

  it("has matching role keys in the base and the dark context", () => {
    const roleKeys = Object.keys(theme.modifiers.color.dark).sort();
    for (const key of roleKeys) {
      expect(theme.tokens).toHaveProperty(key);
    }
  });

  it("has 49 semantic roles in the dark context", () => {
    expect(Object.keys(theme.modifiers.color.dark)).toHaveLength(49);
  });

  it("references only real palette tokens from every dark-context role", () => {
    const tokenKeys = new Set(Object.keys(theme.tokens));
    for (const ref of Object.values(theme.modifiers.color.dark)) {
      expect(tokenKeys.has(ref.slice(1, -1))).toBe(true);
    }
  });

  it("selects the input passed to use", () => {
    expect(preset.use({ color: "light" }).input).toEqual({ color: "light" });
    expect(preset.use({ color: "dark" }).input).toEqual({ color: "dark" });
  });

  it("resolves variant overrides over the base", () => {
    const variant = preset.define({
      id: "override",
      name: "Override",
      tokens: { "indigo-9": "#ff0000" },
    });
    expect(variant.tokens["indigo-9"]).toBe("#ff0000");
    expect(variant.tokens["indigo-1"]).toBe(theme.tokens["indigo-1"]);
  });
});
