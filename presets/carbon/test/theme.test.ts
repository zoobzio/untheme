import { describe, it, expect } from "vitest";
import preset from "../src/preset";
import { CARBON_COLORS } from "../src/constant";

// The base theme the preset ships as its default, taken from a ready config.
const base = preset.use("light").theme;

describe("Carbon preset", () => {
  it("ships the base scheme pairing White with Gray 100", () => {
    expect(base.id).toBe("white-g100");
    expect(base.name).toBe("Carbon");
  });

  it("has 210 reference tokens", () => {
    expect(Object.keys(base.reference)).toHaveLength(210);
  });

  it("includes all 12 families as 10-grade palettes", () => {
    for (const family of CARBON_COLORS) {
      expect(base.reference[`${family}-10`]).toMatch(/^#/);
      expect(base.reference[`${family}-100`]).toMatch(/^#/);
    }
  });

  it("includes pure tone references", () => {
    expect(base.reference["white"]).toBe("#ffffff");
    expect(base.reference["black"]).toBe("#000000");
  });

  it("matches known Carbon palette values", () => {
    expect(base.reference["blue-60"]).toBe("#0f62fe");
    expect(base.reference["red-60"]).toBe("#da1e28");
    expect(base.reference["cool-gray-80"]).toBe("#343a3f");
  });

  it("includes typography tokens", () => {
    expect(base.reference["font-sans"]).toContain("IBM Plex Sans");
    expect(base.reference["font-mono"]).toContain("IBM Plex Mono");
    expect(base.reference["body-01-size"]).toBe("0.875rem");
    expect(base.reference["heading-07-weight"]).toBe("300");
  });

  it("includes spacing tokens", () => {
    expect(base.reference["spacing-01"]).toBe("0.125rem");
    expect(base.reference["spacing-13"]).toBe("10rem");
  });

  it("includes motion tokens", () => {
    expect(base.reference["duration-fast-01"]).toBe("70ms");
    expect(base.reference["easing-standard"]).toContain("cubic-bezier");
  });

  it("declares no role-tier tokens", () => {
    expect(Object.keys(base.roles)).toHaveLength(0);
  });

  it("pairs White (light) with Gray 100 (dark) by default", () => {
    expect(base.system.light["background"]).toBe("white");
    expect(base.system.dark["background"]).toBe("gray-100");
  });

  it("maps text and support roles per mode", () => {
    expect(base.system.light["text-primary"]).toBe("gray-100");
    expect(base.system.dark["text-primary"]).toBe("gray-10");
    expect(base.system.light["support-error"]).toBe("red-60");
    expect(base.system.dark["support-error"]).toBe("red-50");
  });

  it("maps focus to blue in light and white in dark", () => {
    expect(base.system.light["focus"]).toBe("blue-60");
    expect(base.system.dark["focus"]).toBe("white");
  });

  it("has matching system token keys in light and dark modes", () => {
    expect(Object.keys(base.system.light).sort()).toEqual(
      Object.keys(base.system.dark).sort(),
    );
  });

  it("has 31 system tokens per mode", () => {
    expect(Object.keys(base.system.light)).toHaveLength(31);
  });

  it("aliases only real reference tokens from every system token", () => {
    const refKeys = new Set(Object.keys(base.reference));
    const aliases = [
      ...Object.values(base.system.light),
      ...Object.values(base.system.dark),
    ];
    for (const alias of aliases) {
      expect(refKeys.has(alias)).toBe(true);
    }
  });

  it("returns the requested mode from use()", () => {
    expect(preset.use("light").mode).toBe("light");
    expect(preset.use("dark").mode).toBe("dark");
  });

  it("resolves variant overrides over the base", () => {
    const theme = preset.define({
      id: "override",
      name: "Override",
      reference: { "blue-60": "#ff0000" },
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(theme.id).toBe("override");
    expect(theme.reference["blue-60"]).toBe("#ff0000");
    expect(theme.reference["blue-10"]).toBe(base.reference["blue-10"]);
  });
});
