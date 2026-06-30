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

const base = preset.use({ color: "light" }).theme;

describe("M3 preset", () => {
  it("ships the base scheme under its own id", () => {
    expect(base.id).toBe("material-3");
    expect(base.name).toBe("Material 3");
  });

  it("builds a config carrying the requested selection and the base theme", () => {
    expect(preset.use({ color: "light" }).input).toEqual({ color: "light" });
    expect(preset.use({ color: "dark" }).input).toEqual({ color: "dark" });
    expect(preset.use({ color: "dark" }).theme.id).toBe("material-3");
  });

  it("has 719 base tokens (670 palette/scale + 49 semantic roles)", () => {
    expect(Object.keys(base.tokens)).toHaveLength(719);
  });

  it("includes all 22 tonal palettes", () => {
    const colorKeys = Object.keys(base.tokens).filter(
      (k) => /^[a-z]+-\d+$/.test(k) && !k.startsWith("elevation-"),
    );
    const prefixes = new Set(colorKeys.map((k) => k.replace(/-\d+$/, "")));
    expect(prefixes).toEqual(new Set(PALETTES));
  });

  it("includes typography typeface references", () => {
    expect(base.tokens["font-brand"]).toBe("Roboto, sans-serif");
    expect(base.tokens["font-plain"]).toBe("Roboto, sans-serif");
  });

  it("includes all 15 typography scales with 4 properties each", () => {
    const scales = [
      "display-large",
      "display-medium",
      "display-small",
      "headline-large",
      "headline-medium",
      "headline-small",
      "title-large",
      "title-medium",
      "title-small",
      "body-large",
      "body-medium",
      "body-small",
      "label-large",
      "label-medium",
      "label-small",
    ];
    for (const scale of scales) {
      expect(base.tokens[`${scale}-size`]).toBeDefined();
      expect(base.tokens[`${scale}-line-height`]).toBeDefined();
      expect(base.tokens[`${scale}-weight`]).toBeDefined();
      expect(base.tokens[`${scale}-tracking`]).toBeDefined();
    }
  });

  it("includes shape tokens", () => {
    expect(base.tokens["shape-none"]).toBe("0px");
    expect(base.tokens["shape-small"]).toBe("8px");
    expect(base.tokens["shape-full"]).toBe("9999px");
  });

  it("includes elevation tokens", () => {
    expect(base.tokens["elevation-0"]).toBe("none");
    expect(base.tokens["elevation-1"]).toContain("rgb(");
    expect(base.tokens["elevation-5"]).toBeDefined();
  });

  it("includes easing tokens", () => {
    expect(base.tokens["easing-standard"]).toContain("cubic-bezier");
    expect(base.tokens["easing-emphasized"]).toContain("cubic-bezier");
    expect(base.tokens["easing-linear"]).toContain("cubic-bezier");
  });

  it("includes duration tokens", () => {
    expect(base.tokens["duration-short-1"]).toBe("50ms");
    expect(base.tokens["duration-medium-1"]).toBe("250ms");
    expect(base.tokens["duration-long-1"]).toBe("450ms");
    expect(base.tokens["duration-extra-long-4"]).toBe("1000ms");
  });

  it("leaves the light context empty — the base tokens are the light scheme", () => {
    expect(base.order).toEqual(["color"]);
    expect(base.modifiers.color.light).toEqual({});
  });

  it("binds the light scheme color roles to the M3 palette in the base", () => {
    expect(base.tokens["primary"]).toBe("{violet-40}");
    expect(base.tokens["on-primary"]).toBe("{violet-100}");
    expect(base.tokens["secondary"]).toBe("{indigo-40}");
    expect(base.tokens["tertiary"]).toBe("{pink-40}");
    expect(base.tokens["error"]).toBe("{red-40}");
    expect(base.tokens["surface"]).toBe("{neutral-98}");
    expect(base.tokens["background"]).toBe("{neutral-98}");
    expect(base.tokens["outline"]).toBe("{zinc-50}");
  });

  it("remaps the color roles for the dark context", () => {
    expect(base.modifiers.color.dark["primary"]).toBe("{violet-80}");
    expect(base.modifiers.color.dark["secondary"]).toBe("{indigo-80}");
    expect(base.modifiers.color.dark["tertiary"]).toBe("{pink-80}");
    expect(base.modifiers.color.dark["error"]).toBe("{red-80}");
    expect(base.modifiers.color.dark["surface"]).toBe("{neutral-6}");
    expect(base.modifiers.color.dark["outline"]).toBe("{zinc-60}");
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
      tokens: { "violet-40": "#ff0000" },
    });
    expect(variant.tokens["violet-40"]).toBe("#ff0000");
    expect(variant.tokens["violet-80"]).toBe(base.tokens["violet-80"]);
  });

  it("carries the variant identity onto the resolved theme", () => {
    const variant = preset.define({
      id: "override",
      name: "Override",
    });
    expect(variant.id).toBe("override");
    expect(variant.name).toBe("Override");
  });
});
