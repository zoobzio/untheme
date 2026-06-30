import { describe, it, expect } from "vitest";
import { defineUnthemePreset } from "../src/preset";

const base = {
  id: "base",
  name: "Base",
  tokens: {
    white: "#ffffff",
    black: "#000000",
    blue: "#0000ff",
    background: "{white}",
    foreground: "{black}",
    primary: "{foreground}",
  },
  modifiers: {
    color: {
      light: { background: "{white}", foreground: "{black}" },
      dark: { background: "{black}", foreground: "{white}" },
    },
  },
  order: ["color"],
};

const preset = defineUnthemePreset(base);

describe("defineUnthemePreset", () => {
  describe("define", () => {
    it("resolves a layer to a complete theme under its identity", () => {
      const theme = preset.define({
        id: "brand",
        name: "Brand",
        tokens: { blue: "#1e40af" },
        modifiers: { color: { dark: { foreground: "{blue}" } } },
      });
      expect(theme).toEqual({
        id: "brand",
        name: "Brand",
        tokens: {
          white: "#ffffff",
          black: "#000000",
          blue: "#1e40af",
          background: "{white}",
          foreground: "{black}",
          primary: "{foreground}",
        },
        modifiers: {
          color: {
            light: { background: "{white}", foreground: "{black}" },
            dark: { background: "{black}", foreground: "{blue}" },
          },
        },
        order: ["color"],
      });
    });

    it("leaves the base untouched", () => {
      preset.define({
        id: "brand",
        name: "Brand",
        tokens: { blue: "#1e40af" },
      });
      expect(base.tokens.blue).toBe("#0000ff");
    });
  });

  describe("configure", () => {
    const app = preset.configure({
      id: "app",
      name: "App",
      tokens: { blue: "#1e40af", red: "#ff0000", danger: "{red}" },
      modifiers: {
        color: {
          light: { danger: "{red}" },
          dark: { danger: "{red}" },
        },
      },
      order: ["color"],
    });

    it("derives a preset widened by the extension, under its identity", () => {
      const config = app.use({ color: "light" });
      expect(config.theme.id).toBe("app");
      expect(config.theme.name).toBe("App");
      // new tokens join the contract, overrides win, base survives underneath
      expect(config.theme.tokens.red).toBe("#ff0000");
      expect(config.theme.tokens.blue).toBe("#1e40af");
      expect(config.theme.tokens.white).toBe("#ffffff");
      expect(config.theme.tokens.danger).toBe("{red}");
      expect(config.theme.modifiers.color.light.danger).toBe("{red}");
      expect(config.theme.modifiers.color.light.background).toBe("{white}");
    });

    it("resolves derived variants against the widened base", () => {
      const theme = app.define({
        id: "night",
        name: "Night",
        tokens: { red: "#aa0000" },
      });
      expect(theme.tokens.red).toBe("#aa0000");
      expect(theme.tokens.blue).toBe("#1e40af");
    });

    it("leaves the original preset untouched", () => {
      expect(preset.use({ color: "light" }).theme.tokens).not.toHaveProperty(
        "red",
      );
      expect(base.tokens.blue).toBe("#0000ff");
    });
  });

  describe("use", () => {
    it("builds a config from a detached copy of the base", () => {
      const config = preset.use({ color: "dark" });
      expect(config.input).toEqual({ color: "dark" });
      expect(config.override).toEqual({});
      expect(config.theme).toEqual(base);
      expect(config.theme).not.toBe(base);
      config.theme.tokens.white = "#111111";
      expect(preset.use({ color: "dark" }).theme.tokens.white).toBe("#ffffff");
    });
  });
});
