import { describe, it, expect } from "vitest";
import preset from "../src/preset";

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

const { theme: base } = preset.use("light");

describe("M2 preset", () => {
  it("ships the base scheme as a usable config", () => {
    const config = preset.use("light");
    expect(config.mode).toBe("light");
    expect(config.theme.name).toBe("Material 2");
  });

  it("builds a config for either mode", () => {
    expect(preset.use("light").mode).toBe("light");
    expect(preset.use("dark").mode).toBe("dark");
  });

  it("has the expected number of reference tokens", () => {
    // 22 palettes × 14 shades = 308 color tokens
    // + 1 font + 52 typography + 3 shape + 25 elevation + 4 easing + 7 duration = 92
    // Total: 400
    expect(Object.keys(base.reference)).toHaveLength(400);
  });

  it("includes all 22 palettes with 14 shades each", () => {
    const colorKeys = Object.keys(base.reference).filter(
      (k) => /^[a-z]+-(\d+|A\d+)$/.test(k) && !k.startsWith("elevation-"),
    );
    const prefixes = new Set(
      colorKeys.map((k) => k.replace(/-(\d+|A\d+)$/, "")),
    );
    expect(prefixes).toEqual(new Set(PALETTES));
    expect(colorKeys).toHaveLength(308);
  });

  it("includes the typeface reference", () => {
    expect(base.reference["font-default"]).toBe("Roboto, sans-serif");
  });

  it("includes all 13 typography scales", () => {
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
      expect(base.reference[`${scale}-size`]).toBeDefined();
      expect(base.reference[`${scale}-line-height`]).toBeDefined();
      expect(base.reference[`${scale}-weight`]).toBeDefined();
      expect(base.reference[`${scale}-tracking`]).toBeDefined();
    }
  });

  it("includes shape tokens", () => {
    expect(base.reference["shape-small"]).toBe("4px");
    expect(base.reference["shape-medium"]).toBe("4px");
    expect(base.reference["shape-large"]).toBe("0px");
  });

  it("includes all 25 elevation tokens", () => {
    expect(base.reference["elevation-0"]).toBe("none");
    expect(base.reference["elevation-1"]).toContain("rgb(");
    expect(base.reference["elevation-24"]).toBeDefined();
  });

  it("includes easing tokens", () => {
    expect(base.reference["easing-standard"]).toContain("cubic-bezier");
    expect(base.reference["easing-decelerate"]).toContain("cubic-bezier");
    expect(base.reference["easing-accelerate"]).toContain("cubic-bezier");
    expect(base.reference["easing-sharp"]).toContain("cubic-bezier");
  });

  it("includes duration tokens", () => {
    expect(base.reference["duration-shortest"]).toBe("150ms");
    expect(base.reference["duration-standard"]).toBe("300ms");
    expect(base.reference["duration-leaving"]).toBe("195ms");
  });

  it("maps light mode primary to violet", () => {
    expect(base.system.light["primary"]).toBe("violet-500");
    expect(base.system.light["on-primary"]).toBe("neutral-50");
  });

  it("maps light mode secondary to teal", () => {
    expect(base.system.light["secondary"]).toBe("teal-500");
    expect(base.system.light["on-secondary"]).toBe("neutral-50");
  });

  it("maps light mode error to red", () => {
    expect(base.system.light["error"]).toBe("red-500");
  });

  it("maps light mode surface and background to neutral", () => {
    expect(base.system.light["surface"]).toBe("neutral-50");
    expect(base.system.light["background"]).toBe("neutral-50");
  });

  it("maps dark mode system tokens correctly", () => {
    expect(base.system.dark["primary"]).toBe("violet-200");
    expect(base.system.dark["secondary"]).toBe("teal-200");
    expect(base.system.dark["error"]).toBe("red-200");
    expect(base.system.dark["surface"]).toBe("neutral-900");
    expect(base.system.dark["background"]).toBe("neutral-900");
  });

  it("has matching system token keys in light and dark modes", () => {
    expect(Object.keys(base.system.light).sort()).toEqual(
      Object.keys(base.system.dark).sort(),
    );
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

  it("resolves variant overrides over the base", () => {
    const variant = preset.define({
      id: "override",
      name: "Override",
      reference: { "violet-500": "#ff0000" },
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(variant.id).toBe("override");
    expect(variant.reference["violet-500"]).toBe("#ff0000");
    expect(variant.reference["violet-200"]).toBe(base.reference["violet-200"]);
  });
});
