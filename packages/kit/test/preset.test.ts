import { describe, it, expect } from "vitest";
import { defineUnthemePreset } from "../src/preset";

const base = {
  id: "base",
  name: "Base",
  reference: {
    white: "#ffffff",
    black: "#000000",
    blue: "#0000ff",
  },
  system: {
    light: { background: "white", foreground: "black" },
    dark: { background: "black", foreground: "white" },
  },
  roles: { primary: "foreground" },
};

const preset = defineUnthemePreset(base);

describe("defineUnthemePreset", () => {
  describe("define", () => {
    it("resolves a layer to a complete theme under its identity", () => {
      const theme = preset.define({
        id: "brand",
        name: "Brand",
        reference: { blue: "#1e40af" },
        system: { light: {}, dark: { foreground: "blue" } },
        roles: {},
      });
      expect(theme).toEqual({
        id: "brand",
        name: "Brand",
        reference: { white: "#ffffff", black: "#000000", blue: "#1e40af" },
        system: {
          light: { background: "white", foreground: "black" },
          dark: { background: "black", foreground: "blue" },
        },
        roles: { primary: "foreground" },
      });
    });

    it("leaves the base untouched", () => {
      preset.define({
        id: "brand",
        name: "Brand",
        reference: { blue: "#1e40af" },
        system: { light: {}, dark: {} },
        roles: {},
      });
      expect(base.reference.blue).toBe("#0000ff");
    });
  });

  describe("configure", () => {
    const app = preset.configure({
      id: "app",
      name: "App",
      reference: { blue: "#1e40af", red: "#ff0000" },
      system: {
        light: { danger: "red" },
        dark: { danger: "red" },
      },
      roles: { alert: "danger" },
    });

    it("derives a preset widened by the theme, under its identity", () => {
      const config = app.use("light");
      expect(config.theme.id).toBe("app");
      expect(config.theme.name).toBe("App");
      // new tokens join the contract, overrides win, base survives underneath
      expect(config.theme.reference.red).toBe("#ff0000");
      expect(config.theme.reference.blue).toBe("#1e40af");
      expect(config.theme.reference.white).toBe("#ffffff");
      expect(config.theme.system.light.danger).toBe("red");
      expect(config.theme.system.light.background).toBe("white");
      expect(config.theme.roles).toEqual({
        primary: "foreground",
        alert: "danger",
      });
    });

    it("resolves derived variants against the widened base", () => {
      const theme = app.define({
        id: "night",
        name: "Night",
        reference: { red: "#aa0000" },
        system: { light: {}, dark: {} },
        roles: {},
      });
      expect(theme.reference.red).toBe("#aa0000");
      expect(theme.reference.blue).toBe("#1e40af");
    });

    it("leaves the original preset untouched", () => {
      expect(preset.use("light").theme.reference).not.toHaveProperty("red");
      expect(base.reference.blue).toBe("#0000ff");
    });
  });

  describe("use", () => {
    it("builds a config from a detached copy of the base", () => {
      const config = preset.use("dark");
      expect(config.mode).toBe("dark");
      expect(config.theme).toEqual(base);
      expect(config.theme).not.toBe(base);
      config.theme.reference.white = "#111111";
      expect(preset.use("dark").theme.reference.white).toBe("#ffffff");
    });
  });
});
