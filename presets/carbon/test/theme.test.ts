import { describe, it, expect } from "vitest";
import { defineCarbonTheme } from "../src/preset";
import { CARBON_COLORS } from "../src/constant";

describe("defineCarbonTheme", () => {
  it("is a function", () => {
    expect(typeof defineCarbonTheme).toBe("function");
  });

  it("produces a theme with the given label", () => {
    const theme = defineCarbonTheme({ key: "custom", label: "Custom" });
    expect(theme.label).toBe("Custom");
  });

  it("has 210 reference tokens", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(Object.keys(theme.reference)).toHaveLength(210);
  });

  it("includes all 12 families as 10-grade palettes", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    for (const family of CARBON_COLORS) {
      expect(theme.reference[`${family}-10`]).toMatch(/^#/);
      expect(theme.reference[`${family}-100`]).toMatch(/^#/);
    }
  });

  it("includes pure tone references", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.reference["white"]).toBe("#ffffff");
    expect(theme.reference["black"]).toBe("#000000");
  });

  it("matches known Carbon palette values", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.reference["blue-60"]).toBe("#0f62fe");
    expect(theme.reference["red-60"]).toBe("#da1e28");
    expect(theme.reference["cool-gray-80"]).toBe("#343a3f");
  });

  it("includes typography tokens", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.reference["font-sans"]).toContain("IBM Plex Sans");
    expect(theme.reference["font-mono"]).toContain("IBM Plex Mono");
    expect(theme.reference["body-01-size"]).toBe("0.875rem");
    expect(theme.reference["heading-07-weight"]).toBe("300");
  });

  it("includes spacing tokens", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.reference["spacing-01"]).toBe("0.125rem");
    expect(theme.reference["spacing-13"]).toBe("10rem");
  });

  it("includes motion tokens", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.reference["duration-fast-01"]).toBe("70ms");
    expect(theme.reference["easing-standard"]).toContain("cubic-bezier");
  });

  it("pairs White (light) with Gray 100 (dark) by default", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.modes.light["background"]).toBe("white");
    expect(theme.modes.dark["background"]).toBe("gray-100");
  });

  it("maps text and support roles per mode", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.modes.light["text-primary"]).toBe("gray-100");
    expect(theme.modes.dark["text-primary"]).toBe("gray-10");
    expect(theme.modes.light["support-error"]).toBe("red-60");
    expect(theme.modes.dark["support-error"]).toBe("red-50");
  });

  it("maps focus to blue in light and white in dark", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(theme.modes.light["focus"]).toBe("blue-60");
    expect(theme.modes.dark["focus"]).toBe("white");
  });

  it("has matching system token keys in light and dark modes", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    const lightKeys = Object.keys(theme.modes.light).sort();
    const darkKeys = Object.keys(theme.modes.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("has 31 system tokens per mode", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    expect(Object.keys(theme.modes.light)).toHaveLength(31);
  });

  it("aliases only real reference tokens from every system token", () => {
    const theme = defineCarbonTheme({ key: "test", label: "test" });
    const refKeys = new Set(Object.keys(theme.reference));
    const aliases = [
      ...Object.values(theme.modes.light),
      ...Object.values(theme.modes.dark),
    ];
    for (const alias of aliases) {
      expect(refKeys.has(alias)).toBe(true);
    }
  });

  it("allows overriding reference tokens", () => {
    const theme = defineCarbonTheme({
      key: "override",
      label: "override",
      reference: { "blue-60": "#ff0000" },
    });
    expect(theme.reference["blue-60"]).toBe("#ff0000");
    expect(theme.reference["blue-10"]).toBeDefined();
  });
});
