import { describe, it, expect } from "vitest";
import { defineM3Theme } from "../src/theme";

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

  it("includes all 22 tonal palettes in reference tokens", () => {
    const theme = defineM3Theme({ label: "test" });
    const keys = Object.keys(theme.reference);
    const prefixes = new Set(keys.map((k) => k.replace(/-\d+$/, "")));
    expect(prefixes).toEqual(new Set(PALETTES));
  });

  it("has 572 reference tokens (26 tones x 22 palettes)", () => {
    const theme = defineM3Theme({ label: "test" });
    expect(Object.keys(theme.reference)).toHaveLength(572);
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
