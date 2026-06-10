import { describe, it, expect } from "vitest";
import { defineRadixTheme } from "../src/preset";
import { RADIX_SCALES } from "../src/constant";

describe("defineRadixTheme", () => {
  it("is a function", () => {
    expect(typeof defineRadixTheme).toBe("function");
  });

  it("produces a theme with the given label", () => {
    const theme = defineRadixTheme({ label: "Custom" });
    expect(theme.label).toBe("Custom");
  });

  it("has 801 reference tokens", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(Object.keys(theme.reference)).toHaveLength(801);
  });

  it("includes all 31 scales as light and dark 12-step palettes", () => {
    const theme = defineRadixTheme({ label: "test" });
    for (const scale of RADIX_SCALES) {
      expect(theme.reference[`${scale}-1`]).toMatch(/^#/);
      expect(theme.reference[`${scale}-12`]).toMatch(/^#/);
      expect(theme.reference[`${scale}-dark-1`]).toMatch(/^#/);
      expect(theme.reference[`${scale}-dark-12`]).toMatch(/^#/);
    }
  });

  it("light and dark scale values diverge", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.reference["indigo-1"]).not.toBe(
      theme.reference["indigo-dark-1"],
    );
  });

  it("includes pure tone references", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.reference["white"]).toBe("#ffffff");
    expect(theme.reference["black"]).toBe("#000000");
  });

  it("includes radius tokens", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.reference["radius-1"]).toBe("3px");
    expect(theme.reference["radius-full"]).toBe("9999px");
  });

  it("includes spacing tokens", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.reference["space-1"]).toBe("4px");
    expect(theme.reference["space-9"]).toBe("64px");
  });

  it("includes typography tokens", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.reference["font-sans"]).toContain("sans-serif");
    expect(theme.reference["font-size-1"]).toBe("12px");
    expect(theme.reference["line-height-1"]).toBe("16px");
    expect(theme.reference["letter-spacing-1"]).toBe("0.0025em");
    expect(theme.reference["weight-regular"]).toBe("400");
  });

  it("includes shadow tokens", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.reference["shadow-1"]).toContain("inset");
    expect(theme.reference["shadow-6"]).toContain("rgb(");
  });

  it("maps the accent role to indigo per Radix step semantics", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.modes.light["accent-solid"]).toBe("indigo-9");
    expect(theme.modes.light["accent-text"]).toBe("indigo-12");
    expect(theme.modes.dark["accent-solid"]).toBe("indigo-dark-9");
    expect(theme.modes.dark["accent-text"]).toBe("indigo-dark-12");
  });

  it("maps the gray role to slate", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.modes.light["gray-app-bg"]).toBe("slate-1");
    expect(theme.modes.dark["gray-app-bg"]).toBe("slate-dark-1");
  });

  it("maps status roles to their functional scales", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.modes.light["error-solid"]).toBe("red-9");
    expect(theme.modes.light["success-solid"]).toBe("green-9");
    expect(theme.modes.light["warning-solid"]).toBe("amber-9");
    expect(theme.modes.light["info-solid"]).toBe("blue-9");
  });

  it("resolves solid contrast to a pure tone", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(theme.modes.light["accent-contrast"]).toBe("white");
    expect(theme.modes.dark["accent-contrast"]).toBe("white");
  });

  it("has matching system token keys in light and dark modes", () => {
    const theme = defineRadixTheme({ label: "test" });
    const lightKeys = Object.keys(theme.modes.light).sort();
    const darkKeys = Object.keys(theme.modes.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("has 49 system tokens per mode", () => {
    const theme = defineRadixTheme({ label: "test" });
    expect(Object.keys(theme.modes.light)).toHaveLength(49);
  });

  it("allows overriding reference tokens", () => {
    const theme = defineRadixTheme({
      label: "override",
      reference: { "indigo-9": "#ff0000" },
    });
    expect(theme.reference["indigo-9"]).toBe("#ff0000");
    expect(theme.reference["indigo-1"]).toBeDefined();
  });
});
