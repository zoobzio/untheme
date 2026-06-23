import { describe, it, expect } from "vitest";
import preset from "../src/preset";
import { RADIX_SCALES } from "../src/constant";

const { theme } = preset.use("light");

describe("Radix preset", () => {
  it("ships the base scheme", () => {
    expect(theme.name).toBe("Radix UI");
  });

  it("has 801 reference tokens", () => {
    expect(Object.keys(theme.reference)).toHaveLength(801);
  });

  it("includes all 31 scales as light and dark 12-step palettes", () => {
    for (const scale of RADIX_SCALES) {
      expect(theme.reference[`${scale}-1`]).toMatch(/^#/);
      expect(theme.reference[`${scale}-12`]).toMatch(/^#/);
      expect(theme.reference[`${scale}-dark-1`]).toMatch(/^#/);
      expect(theme.reference[`${scale}-dark-12`]).toMatch(/^#/);
    }
  });

  it("light and dark scale values diverge", () => {
    expect(theme.reference["indigo-1"]).not.toBe(
      theme.reference["indigo-dark-1"],
    );
  });

  it("includes pure tone references", () => {
    expect(theme.reference["white"]).toBe("#ffffff");
    expect(theme.reference["black"]).toBe("#000000");
  });

  it("includes radius tokens", () => {
    expect(theme.reference["radius-1"]).toBe("3px");
    expect(theme.reference["radius-full"]).toBe("9999px");
  });

  it("includes spacing tokens", () => {
    expect(theme.reference["space-1"]).toBe("4px");
    expect(theme.reference["space-9"]).toBe("64px");
  });

  it("includes typography tokens", () => {
    expect(theme.reference["font-sans"]).toContain("sans-serif");
    expect(theme.reference["font-size-1"]).toBe("12px");
    expect(theme.reference["line-height-1"]).toBe("16px");
    expect(theme.reference["letter-spacing-1"]).toBe("0.0025em");
    expect(theme.reference["weight-regular"]).toBe("400");
  });

  it("includes shadow tokens", () => {
    expect(theme.reference["shadow-1"]).toContain("inset");
    expect(theme.reference["shadow-6"]).toContain("rgb(");
  });

  it("maps the accent role to indigo per Radix step semantics", () => {
    expect(theme.system.light["accent-solid"]).toBe("indigo-9");
    expect(theme.system.light["accent-text"]).toBe("indigo-12");
    expect(theme.system.dark["accent-solid"]).toBe("indigo-dark-9");
    expect(theme.system.dark["accent-text"]).toBe("indigo-dark-12");
  });

  it("maps the gray role to slate", () => {
    expect(theme.system.light["gray-app-bg"]).toBe("slate-1");
    expect(theme.system.dark["gray-app-bg"]).toBe("slate-dark-1");
  });

  it("maps status roles to their functional scales", () => {
    expect(theme.system.light["error-solid"]).toBe("red-9");
    expect(theme.system.light["success-solid"]).toBe("green-9");
    expect(theme.system.light["warning-solid"]).toBe("amber-9");
    expect(theme.system.light["info-solid"]).toBe("blue-9");
  });

  it("resolves solid contrast to a pure tone", () => {
    expect(theme.system.light["accent-contrast"]).toBe("white");
    expect(theme.system.dark["accent-contrast"]).toBe("white");
  });

  it("has matching system token keys in light and dark modes", () => {
    expect(Object.keys(theme.system.light).sort()).toEqual(
      Object.keys(theme.system.dark).sort(),
    );
  });

  it("has 49 system tokens per mode", () => {
    expect(Object.keys(theme.system.light)).toHaveLength(49);
  });

  it("aliases only real reference tokens from every system token", () => {
    const refKeys = new Set(Object.keys(theme.reference));
    const aliases = [
      ...Object.values(theme.system.light),
      ...Object.values(theme.system.dark),
    ];
    for (const alias of aliases) {
      expect(refKeys.has(alias)).toBe(true);
    }
  });

  it("selects the mode passed to use", () => {
    expect(preset.use("light").mode).toBe("light");
    expect(preset.use("dark").mode).toBe("dark");
  });

  it("resolves variant overrides over the base", () => {
    const variant = preset.define({
      id: "override",
      name: "Override",
      reference: { "indigo-9": "#ff0000" },
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(variant.reference["indigo-9"]).toBe("#ff0000");
    expect(variant.reference["indigo-1"]).toBe(theme.reference["indigo-1"]);
  });
});
