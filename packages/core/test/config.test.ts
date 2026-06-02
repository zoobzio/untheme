import { describe, it, expect, expectTypeOf } from "vitest";
import { defineThemeConfig } from "../src/config";
import type { ThemeTemplate, Theme } from "../src/types";

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
  roles: {
    primary: "#0000ff",
  },
} as const satisfies ThemeTemplate;

describe("defineThemeConfig", () => {
  const createTheme = defineThemeConfig(template);

  it("returns the base template when no overrides are provided", () => {
    const theme = createTheme({});
    expect(theme.label).toBe("test");
    expect(theme.reference).toEqual(template.reference);
    expect(theme.modes).toEqual(template.modes);
    expect(theme.roles).toEqual(template.roles);
  });

  it("overrides label", () => {
    const theme = createTheme({ label: "custom" });
    expect(theme.label).toBe("custom");
  });

  it("overrides reference tokens", () => {
    const theme = createTheme({
      reference: { white: "#fefefe", black: "#111111", blue: "#0011ff" },
    });
    expect(theme.reference.white).toBe("#fefefe");
    expect(theme.reference.black).toBe("#111111");
    expect(theme.reference.blue).toBe("#0011ff");
  });

  it("overrides mode tokens", () => {
    const theme = createTheme({
      modes: {
        light: { background: "white", foreground: "black" },
        dark: { background: "black", foreground: "white" },
      },
    });
    expect(theme.modes.light.background).toBe("white");
    expect(theme.modes.dark.foreground).toBe("white");
  });

  it("overrides role tokens", () => {
    const theme = createTheme({
      roles: { primary: "blue" },
    });
    expect(theme.roles.primary).toBe("blue");
  });

  it("preserves base values for non-overridden fields", () => {
    const theme = createTheme({ label: "partial" });
    expect(theme.reference).toEqual(template.reference);
    expect(theme.modes).toEqual(template.modes);
    expect(theme.roles).toEqual(template.roles);
  });

  it("returns a value matching the Theme type", () => {
    const theme = createTheme({});
    expectTypeOf(theme).toMatchTypeOf<Theme<typeof template>>();
  });
});
