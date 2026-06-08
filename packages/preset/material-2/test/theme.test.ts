import { describe, it, expect } from "vitest";
import { defineM2Theme } from "../src/preset";

const PALETTES = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
];

describe("defineM2Theme", () => {
  it("is a function", () => {
    expect(typeof defineM2Theme).toBe("function");
  });

  it("produces a theme with the given label", () => {
    const theme = defineM2Theme({ key: "custom", label: "Custom" });
    expect(theme.label).toBe("Custom");
  });

  it("has the expected number of reference tokens", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    // 22 palettes × 14 shades = 308 color tokens
    // + 1 font + 52 typography + 3 shape + 25 elevation + 4 easing + 7 duration = 92
    // Total: 400
    expect(Object.keys(theme.reference)).toHaveLength(400);
  });

  it("includes all 22 palettes with 14 shades each", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    const colorKeys = Object.keys(theme.reference).filter(
      (k) => /^[a-z]+-(\d+|A\d+)$/.test(k) && !k.startsWith("elevation-"),
    );
    const prefixes = new Set(
      colorKeys.map((k) => k.replace(/-(\d+|A\d+)$/, "")),
    );
    expect(prefixes).toEqual(new Set(PALETTES));
    expect(colorKeys).toHaveLength(308);
  });

  it("includes the typeface reference", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.reference["font-default"]).toBe("Roboto, sans-serif");
  });

  it("includes all 13 typography scales", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    const scales = [
      "headline-1",
      "headline-2",
      "headline-3",
      "headline-4",
      "headline-5",
      "headline-6",
      "subtitle-1",
      "subtitle-2",
      "body-1",
      "body-2",
      "button",
      "caption",
      "overline",
    ];
    for (const scale of scales) {
      expect(theme.reference[`${scale}-size`]).toBeDefined();
      expect(theme.reference[`${scale}-line-height`]).toBeDefined();
      expect(theme.reference[`${scale}-weight`]).toBeDefined();
      expect(theme.reference[`${scale}-tracking`]).toBeDefined();
    }
  });

  it("includes shape tokens", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.reference["shape-small"]).toBe("4px");
    expect(theme.reference["shape-medium"]).toBe("4px");
    expect(theme.reference["shape-large"]).toBe("0px");
  });

  it("includes all 25 elevation tokens", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.reference["elevation-0"]).toBe("none");
    expect(theme.reference["elevation-1"]).toContain("rgb(");
    expect(theme.reference["elevation-24"]).toBeDefined();
  });

  it("includes easing tokens", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.reference["easing-standard"]).toContain("cubic-bezier");
    expect(theme.reference["easing-decelerate"]).toContain("cubic-bezier");
    expect(theme.reference["easing-accelerate"]).toContain("cubic-bezier");
    expect(theme.reference["easing-sharp"]).toContain("cubic-bezier");
  });

  it("includes duration tokens", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.reference["duration-shortest"]).toBe("150ms");
    expect(theme.reference["duration-standard"]).toBe("300ms");
    expect(theme.reference["duration-leaving"]).toBe("195ms");
  });

  it("maps light mode primary to violet", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.modes.light["primary"]).toBe("violet-500");
    expect(theme.modes.light["on-primary"]).toBe("neutral-50");
  });

  it("maps light mode secondary to teal", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.modes.light["secondary"]).toBe("teal-500");
    expect(theme.modes.light["on-secondary"]).toBe("neutral-50");
  });

  it("maps light mode error to red", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.modes.light["error"]).toBe("red-500");
  });

  it("maps light mode surface and background to neutral", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.modes.light["surface"]).toBe("neutral-50");
    expect(theme.modes.light["background"]).toBe("neutral-50");
  });

  it("maps dark mode system tokens correctly", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    expect(theme.modes.dark["primary"]).toBe("violet-200");
    expect(theme.modes.dark["secondary"]).toBe("teal-200");
    expect(theme.modes.dark["error"]).toBe("red-200");
    expect(theme.modes.dark["surface"]).toBe("neutral-900");
    expect(theme.modes.dark["background"]).toBe("neutral-900");
  });

  it("has matching system token keys in light and dark modes", () => {
    const theme = defineM2Theme({ key: "test", label: "test" });
    const lightKeys = Object.keys(theme.modes.light).sort();
    const darkKeys = Object.keys(theme.modes.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("allows overriding reference tokens", () => {
    const theme = defineM2Theme({
      key: "override",
      label: "override",
      reference: { "violet-500": "#ff0000" },
    });
    expect(theme.reference["violet-500"]).toBe("#ff0000");
    expect(theme.reference["violet-200"]).toBeDefined();
  });
});
