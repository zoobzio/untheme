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

const base = preset.use("light").theme;

describe("M3 preset", () => {
  it("ships the base scheme under its own id", () => {
    expect(base.id).toBe("material-3");
    expect(base.name).toBe("Material 3");
  });

  it("builds a config carrying the requested mode and the base theme", () => {
    expect(preset.use("light").mode).toBe("light");
    expect(preset.use("dark").mode).toBe("dark");
    expect(preset.use("dark").theme.id).toBe("material-3");
  });

  it("has 670 reference tokens", () => {
    expect(Object.keys(base.reference)).toHaveLength(670);
  });

  it("includes all 22 tonal palettes", () => {
    const colorKeys = Object.keys(base.reference).filter(
      (k) => /^[a-z]+-\d+$/.test(k) && !k.startsWith("elevation-"),
    );
    const prefixes = new Set(colorKeys.map((k) => k.replace(/-\d+$/, "")));
    expect(prefixes).toEqual(new Set(PALETTES));
  });

  it("includes typography typeface references", () => {
    expect(base.reference["font-brand"]).toBe("Roboto, sans-serif");
    expect(base.reference["font-plain"]).toBe("Roboto, sans-serif");
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
      expect(base.reference[`${scale}-size`]).toBeDefined();
      expect(base.reference[`${scale}-line-height`]).toBeDefined();
      expect(base.reference[`${scale}-weight`]).toBeDefined();
      expect(base.reference[`${scale}-tracking`]).toBeDefined();
    }
  });

  it("includes shape tokens", () => {
    expect(base.reference["shape-none"]).toBe("0px");
    expect(base.reference["shape-small"]).toBe("8px");
    expect(base.reference["shape-full"]).toBe("9999px");
  });

  it("includes elevation tokens", () => {
    expect(base.reference["elevation-0"]).toBe("none");
    expect(base.reference["elevation-1"]).toContain("rgb(");
    expect(base.reference["elevation-5"]).toBeDefined();
  });

  it("includes easing tokens", () => {
    expect(base.reference["easing-standard"]).toContain("cubic-bezier");
    expect(base.reference["easing-emphasized"]).toContain("cubic-bezier");
    expect(base.reference["easing-linear"]).toContain("cubic-bezier");
  });

  it("includes duration tokens", () => {
    expect(base.reference["duration-short-1"]).toBe("50ms");
    expect(base.reference["duration-medium-1"]).toBe("250ms");
    expect(base.reference["duration-long-1"]).toBe("450ms");
    expect(base.reference["duration-extra-long-4"]).toBe("1000ms");
  });

  it("maps light mode color roles to the M3 palette", () => {
    expect(base.system.light["primary"]).toBe("violet-40");
    expect(base.system.light["on-primary"]).toBe("violet-100");
    expect(base.system.light["secondary"]).toBe("indigo-40");
    expect(base.system.light["tertiary"]).toBe("pink-40");
    expect(base.system.light["error"]).toBe("red-40");
    expect(base.system.light["surface"]).toBe("neutral-98");
    expect(base.system.light["background"]).toBe("neutral-98");
    expect(base.system.light["outline"]).toBe("zinc-50");
  });

  it("maps dark mode color roles to the M3 palette", () => {
    expect(base.system.dark["primary"]).toBe("violet-80");
    expect(base.system.dark["secondary"]).toBe("indigo-80");
    expect(base.system.dark["tertiary"]).toBe("pink-80");
    expect(base.system.dark["error"]).toBe("red-80");
    expect(base.system.dark["surface"]).toBe("neutral-6");
    expect(base.system.dark["outline"]).toBe("zinc-60");
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
      reference: { "violet-40": "#ff0000" },
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(variant.reference["violet-40"]).toBe("#ff0000");
    expect(variant.reference["violet-80"]).toBe(base.reference["violet-80"]);
  });

  it("carries the variant identity onto the resolved theme", () => {
    const variant = preset.define({
      id: "override",
      name: "Override",
      reference: {},
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(variant.id).toBe("override");
    expect(variant.name).toBe("Override");
  });
});
