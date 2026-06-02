import { describe, it, expect } from "vitest";
import { defineUnthemeConfig } from "../src/config";
import type { Config } from "../src/types";

const template = {
  label: "test",
  reference: {
    white: "#ffffff",
    black: "#000000",
    blue: "#0000ff",
  },
  modes: {
    light: {
      background: "#ffffff",
      foreground: "#000000",
    },
    dark: {
      background: "#000000",
      foreground: "#ffffff",
    },
  },
} satisfies Config<string, string>;

describe("defineUnthemeConfig", () => {
  const createTheme = defineUnthemeConfig(template);

  it("returns the base template when no overrides are provided", () => {
    const theme = createTheme({
      label: "my-test",
    });
    expect(theme.label).toBe("my-test");
    expect(theme.reference).toEqual(template.reference);
    expect(theme.modes).toEqual(template.modes);
  });

  it("overrides label", () => {
    const theme = createTheme({ label: "custom" });
    expect(theme.label).toBe("custom");
  });

  it("overrides reference tokens", () => {
    const theme = createTheme({
      label: "my-test",
      reference: { white: "#fefefe", black: "#111111", blue: "#0011ff" },
    });
    expect(theme.reference.white).toBe("#fefefe");
    expect(theme.reference.black).toBe("#111111");
    expect(theme.reference.blue).toBe("#0011ff");
  });

  it("overrides mode tokens", () => {
    const theme = createTheme({
      label: "my-test",
      modes: {
        light: { background: "white", foreground: "black" },
        dark: { background: "black", foreground: "white" },
      },
    });
    expect(theme.modes.light.background).toBe("white");
    expect(theme.modes.dark.foreground).toBe("white");
  });

  it("preserves base values for non-overridden fields", () => {
    const theme = createTheme({ label: "partial" });
    expect(theme.reference).toEqual(template.reference);
    expect(theme.modes).toEqual(template.modes);
  });
});
