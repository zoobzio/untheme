import { describe, it, expect } from "vitest";
import { defineM3Theme } from "../src/preset";

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

describe("defineM3Theme", () => {
  it("is a function", () => {
    expect(typeof defineM3Theme).toBe("function");
  });

  it("produces a theme with the given label", () => {
    const theme = defineM3Theme({ label: "Custom" });
    expect(theme.label).toBe("Custom");
  });

  it("has 670 reference tokens", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(Object.keys(theme.reference)).toHaveLength(670);
  });

  it("includes all 22 tonal palettes", () => {
    const theme = defineM3Theme({ label: "test" });
    const colorKeys = Object.keys(theme.reference).filter(
      (k) => /^[a-z]+-\d+$/.test(k) && !k.startsWith("elevation-"),
    );
    const prefixes = new Set(colorKeys.map((k) => k.replace(/-\d+$/, "")));
    expect(prefixes).toEqual(new Set(PALETTES));
  });

  it("includes typography typeface references", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.reference["font-brand"]).toBe("Roboto, sans-serif");
    expect(theme.reference["font-plain"]).toBe("Roboto, sans-serif");
  });

  it("includes all 15 typography scales with 4 properties each", () => {
    const theme = defineM3Theme({ label: "test" });
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
      expect(theme.reference[`${scale}-size`]).toBeDefined();
      expect(theme.reference[`${scale}-line-height`]).toBeDefined();
      expect(theme.reference[`${scale}-weight`]).toBeDefined();
      expect(theme.reference[`${scale}-tracking`]).toBeDefined();
    }
  });

  it("includes shape tokens", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.reference["shape-none"]).toBe("0px");
    expect(theme.reference["shape-small"]).toBe("8px");
    expect(theme.reference["shape-full"]).toBe("9999px");
  });

  it("includes elevation tokens", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.reference["elevation-0"]).toBe("none");
    expect(theme.reference["elevation-1"]).toContain("rgb(");
    expect(theme.reference["elevation-5"]).toBeDefined();
  });

  it("includes easing tokens", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.reference["easing-standard"]).toContain("cubic-bezier");
    expect(theme.reference["easing-emphasized"]).toContain("cubic-bezier");
    expect(theme.reference["easing-linear"]).toContain("cubic-bezier");
  });

  it("includes duration tokens", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.reference["duration-short-1"]).toBe("50ms");
    expect(theme.reference["duration-medium-1"]).toBe("250ms");
    expect(theme.reference["duration-long-1"]).toBe("450ms");
    expect(theme.reference["duration-extra-long-4"]).toBe("1000ms");
  });

  it("maps light mode primary to violet", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.modes.light["primary"]).toBe("violet-40");
    expect(theme.modes.light["on-primary"]).toBe("violet-100");
  });

  it("maps light mode secondary to indigo", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.modes.light["secondary"]).toBe("indigo-40");
    expect(theme.modes.light["on-secondary"]).toBe("indigo-100");
  });

  it("maps light mode tertiary to pink", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.modes.light["tertiary"]).toBe("pink-40");
    expect(theme.modes.light["on-tertiary"]).toBe("pink-100");
  });

  it("maps light mode error to red", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.modes.light["error"]).toBe("red-40");
  });

  it("maps light mode surfaces to neutral", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.modes.light["surface"]).toBe("neutral-98");
    expect(theme.modes.light["background"]).toBe("neutral-98");
  });

  it("maps light mode outline to zinc", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.modes.light["outline"]).toBe("zinc-50");
    expect(theme.modes.light["surface-variant"]).toBe("zinc-90");
  });

  it("maps dark mode system tokens correctly", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(theme.modes.dark["primary"]).toBe("violet-80");
    expect(theme.modes.dark["secondary"]).toBe("indigo-80");
    expect(theme.modes.dark["tertiary"]).toBe("pink-80");
    expect(theme.modes.dark["error"]).toBe("red-80");
    expect(theme.modes.dark["surface"]).toBe("neutral-6");
    expect(theme.modes.dark["outline"]).toBe("zinc-60");
  });

  it("has matching system token keys in light and dark modes", () => {
    const theme = defineM3Theme({ label: "test" });
    const lightKeys = Object.keys(theme.modes.light).sort();
    const darkKeys = Object.keys(theme.modes.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("allows overriding reference tokens", () => {
    const theme = defineM3Theme({
      label: "override",
      reference: { "violet-40": "#ff0000" },
    });
    expect(theme.reference["violet-40"]).toBe("#ff0000");
    expect(theme.reference["violet-80"]).toBeDefined();
  });
});
