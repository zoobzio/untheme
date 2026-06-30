import { describe, it, expect } from "vitest";
import { extend } from "../src/extend";

const base = {
  id: "base",
  name: "Base",
  tokens: {
    white: "#ffffff",
    black: "#000000",
    bg: "{white}",
    fg: "{black}",
  },
  modifiers: {
    color: {
      light: { bg: "{white}", fg: "{black}" },
      dark: { bg: "{black}", fg: "{white}" },
    },
  },
  order: ["color"],
};

const extension = {
  id: "ext",
  name: "Ext",
  tokens: { accent: "#0090ff", bg: "{accent}" },
  modifiers: {
    color: { dark: { fg: "{accent}" } },
    density: {
      compact: { bg: "{white}" },
      cozy: {},
    },
  },
  order: ["density", "color"],
};

describe("extend", () => {
  it("adds new tokens and overrides existing ones", () => {
    const result = extend(base, extension);
    expect(result.tokens.accent).toBe("#0090ff");
    expect(result.tokens.bg).toBe("{accent}");
    expect(result.tokens.white).toBe("#ffffff");
  });

  it("adds new modifiers wholesale", () => {
    const result = extend(base, extension);
    expect(result.modifiers.density).toEqual({
      compact: { bg: "{white}" },
      cozy: {},
    });
  });

  it("deep merges an existing modifier context, leaf by leaf", () => {
    const result = extend(base, extension);
    // dark keeps its bg from the base, only fg is overridden
    expect(result.modifiers.color.dark).toEqual({
      bg: "{black}",
      fg: "{accent}",
    });
    // light is untouched
    expect(result.modifiers.color.light).toEqual(base.modifiers.color.light);
  });

  it("dedupes order and appends the extension's", () => {
    const result = extend(base, extension);
    expect(result.order).toEqual(["density", "color"]);
  });

  it("takes the extension's identity", () => {
    const result = extend(base, extension);
    expect(result.id).toBe("ext");
    expect(result.name).toBe("Ext");
  });

  it("mutates neither input and returns detached records", () => {
    const result = extend(base, extension);
    result.tokens.bg = "#111111";
    result.modifiers.color.dark.fg = "{white}";
    expect(base.tokens.bg).toBe("{white}");
    expect(base.modifiers.color.dark.fg).toBe("{white}");
    expect(extension.tokens.bg).toBe("{accent}");
  });
});
