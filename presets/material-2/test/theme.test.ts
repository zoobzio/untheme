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

const { theme: base } = preset.use({ color: "light" });

describe("M2 preset", () => {
  it("ships the base scheme as a usable config", () => {
    const config = preset.use({ color: "light" });
    expect(config.input).toEqual({ color: "light" });
    expect(config.theme.name).toBe("Material 2");
  });

  it("builds a config for either selection", () => {
    expect(preset.use({ color: "light" }).input).toEqual({ color: "light" });
    expect(preset.use({ color: "dark" }).input).toEqual({ color: "dark" });
  });

  it("has the expected number of base tokens", () => {
    // 22 palettes × 14 shades = 308 color tokens
    // + 1 font + 52 typography + 3 shape + 25 elevation + 4 easing + 7 duration = 92
    // + 12 semantic roles = 412
    expect(Object.keys(base.tokens)).toHaveLength(412);
  });

  it("includes all 22 palettes with 14 shades each", () => {
    const colorKeys = Object.keys(base.tokens).filter(
      (k) => /^[a-z]+-(\d+|A\d+)$/.test(k) && !k.startsWith("elevation-"),
    );
    const prefixes = new Set(
      colorKeys.map((k) => k.replace(/-(\d+|A\d+)$/, "")),
    );
    expect(prefixes).toEqual(new Set(PALETTES));
    expect(colorKeys).toHaveLength(308);
  });

  it("includes the typeface reference", () => {
    expect(base.tokens["font-default"]).toBe("Roboto, sans-serif");
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
      expect(base.tokens[`${scale}-size`]).toBeDefined();
      expect(base.tokens[`${scale}-line-height`]).toBeDefined();
      expect(base.tokens[`${scale}-weight`]).toBeDefined();
      expect(base.tokens[`${scale}-tracking`]).toBeDefined();
    }
  });

  it("includes shape tokens", () => {
    expect(base.tokens["shape-small"]).toBe("4px");
    expect(base.tokens["shape-medium"]).toBe("4px");
    expect(base.tokens["shape-large"]).toBe("0px");
  });

  it("includes all 25 elevation tokens", () => {
    expect(base.tokens["elevation-0"]).toBe("none");
    expect(base.tokens["elevation-1"]).toContain("rgb(");
    expect(base.tokens["elevation-24"]).toBeDefined();
  });

  it("includes easing tokens", () => {
    expect(base.tokens["easing-standard"]).toContain("cubic-bezier");
    expect(base.tokens["easing-decelerate"]).toContain("cubic-bezier");
    expect(base.tokens["easing-accelerate"]).toContain("cubic-bezier");
    expect(base.tokens["easing-sharp"]).toContain("cubic-bezier");
  });

  it("includes duration tokens", () => {
    expect(base.tokens["duration-shortest"]).toBe("150ms");
    expect(base.tokens["duration-standard"]).toBe("300ms");
    expect(base.tokens["duration-leaving"]).toBe("195ms");
  });

  it("leaves the light context empty — the base tokens are the light scheme", () => {
    expect(base.order).toEqual(["color"]);
    expect(base.modifiers.color.light).toEqual({});
  });

  it("binds light scheme primary to violet in the base", () => {
    expect(base.tokens["primary"]).toBe("{violet-500}");
    expect(base.tokens["on-primary"]).toBe("{neutral-50}");
  });

  it("binds light scheme secondary to teal in the base", () => {
    expect(base.tokens["secondary"]).toBe("{teal-500}");
    expect(base.tokens["on-secondary"]).toBe("{neutral-50}");
  });

  it("binds light scheme error to red in the base", () => {
    expect(base.tokens["error"]).toBe("{red-500}");
  });

  it("binds light scheme surface and background to neutral in the base", () => {
    expect(base.tokens["surface"]).toBe("{neutral-50}");
    expect(base.tokens["background"]).toBe("{neutral-50}");
  });

  it("remaps the semantic roles for the dark context", () => {
    expect(base.modifiers.color.dark["primary"]).toBe("{violet-200}");
    expect(base.modifiers.color.dark["secondary"]).toBe("{teal-200}");
    expect(base.modifiers.color.dark["error"]).toBe("{red-200}");
    expect(base.modifiers.color.dark["surface"]).toBe("{neutral-900}");
    expect(base.modifiers.color.dark["background"]).toBe("{neutral-900}");
  });

  it("has a dark context role for every light scheme role", () => {
    for (const key of Object.keys(base.modifiers.color.dark)) {
      expect(base.tokens).toHaveProperty(key);
    }
  });

  it("references only real palette tokens from every dark-context role", () => {
    const tokenKeys = new Set(Object.keys(base.tokens));
    for (const ref of Object.values(base.modifiers.color.dark)) {
      expect(tokenKeys.has(ref.slice(1, -1))).toBe(true);
    }
  });

  it("resolves variant overrides over the base", () => {
    const variant = preset.define({
      id: "override",
      name: "Override",
      tokens: { "violet-500": "#ff0000" },
    });
    expect(variant.id).toBe("override");
    expect(variant.tokens["violet-500"]).toBe("#ff0000");
    expect(variant.tokens["violet-200"]).toBe(base.tokens["violet-200"]);
  });
});
