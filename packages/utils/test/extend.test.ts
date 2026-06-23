import { describe, it, expect } from "vitest";
import { extend } from "../src/extend";

const base = {
  id: "test",
  name: "Test",
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

describe("extend", () => {
  it("returns a detached copy for an empty extension", () => {
    const theme = extend(base, {
      reference: {},
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(theme).toEqual(base);
    expect(theme).not.toBe(base);
    theme.reference.white = "#111111";
    expect(base.reference.white).toBe("#ffffff");
  });

  it("overrides base tokens where the extension binds them", () => {
    const theme = extend(base, {
      reference: { blue: "#0090ff" },
      system: { light: {}, dark: { foreground: "blue" } },
      roles: {},
    });
    expect(theme.reference.blue).toBe("#0090ff");
    expect(theme.reference.white).toBe("#ffffff");
    expect(theme.system.dark.foreground).toBe("blue");
    expect(theme.system.light).toEqual(base.system.light);
  });

  it("widens the contract with new tokens aliasing their own or base tokens", () => {
    const theme = extend(base, {
      reference: { red: "#ff0000" },
      system: {
        light: { danger: "red", canvas: "white" },
        dark: { danger: "red", canvas: "black" },
      },
      roles: { alert: "danger" },
    });
    // new tokens join the contract alongside the base's
    expect(theme.reference).toEqual({ ...base.reference, red: "#ff0000" });
    expect(theme.system.light.danger).toBe("red");
    expect(theme.system.light.canvas).toBe("white");
    expect(theme.system.light.background).toBe("white");
    expect(theme.roles).toEqual({ primary: "foreground", alert: "danger" });
  });

  it("takes the extension's identity when it carries one", () => {
    const theme = extend(base, {
      id: "wide",
      name: "Wide",
      reference: {},
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(theme.id).toBe("wide");
    expect(theme.name).toBe("Wide");
  });

  it("keeps the base identity when the extension has none", () => {
    const theme = extend(base, {
      reference: { red: "#ff0000" },
      system: { light: {}, dark: {} },
      roles: {},
    });
    expect(theme.id).toBe("test");
    expect(theme.name).toBe("Test");
  });

  it("mutates neither input and returns detached records", () => {
    const extension = {
      reference: { red: "#ff0000" },
      system: { light: {}, dark: {} },
      roles: {},
    };
    const theme = extend(base, extension);
    theme.reference.red = "#aa0000";
    theme.system.light.background = "blue";
    expect(base.reference).not.toHaveProperty("red");
    expect(base.system.light.background).toBe("white");
    expect(extension.reference.red).toBe("#ff0000");
  });
});
