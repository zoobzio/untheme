import { describe, expect, it } from "vitest";

import { CircularAliasError, SchemaError } from "untheme";

import { bootUntheme } from "../src/boot";
import { proveTheme, resolveAll, selections } from "../src/prove";
import { mockTheme } from "../src/theme";

const theme = mockTheme({
  tokens: {
    white: "#fff",
    black: "#000",
    surface: "{white}",
    gap: "8px",
  },
  modifiers: {
    color: { light: {}, dark: { surface: "{black}" } },
    density: { default: {}, compact: { gap: "4px" }, cozy: { gap: "6px" } },
  },
});

describe("selections", () => {
  it("lists the boot selection and each single-context deviation", () => {
    expect(selections(theme)).toEqual([
      { color: "light", density: "default" },
      { color: "dark", density: "default" },
      { color: "light", density: "compact" },
      { color: "light", density: "cozy" },
    ]);
  });

  it("lists every combination when exhaustive", () => {
    const all = selections(theme, { exhaustive: true });
    expect(all).toHaveLength(6);
    expect(all).toContainEqual({ color: "dark", density: "cozy" });
  });

  it("is the one empty selection for a theme without modifiers", () => {
    const plain = mockTheme({ tokens: { a: 1 } });
    expect(selections(plain)).toEqual([{}]);
    expect(selections(plain, { exhaustive: true })).toEqual([{}]);
  });
});

describe("resolveAll", () => {
  it("resolves every token at the active selection", () => {
    const untheme = bootUntheme(theme, { color: "dark" });
    expect(resolveAll(untheme)).toEqual({
      white: theme.tokens.white.$value,
      black: theme.tokens.black.$value,
      surface: theme.tokens.black.$value,
      gap: { value: 8, unit: "px" },
    });
  });

  it("resolves at a given selection and restores the active one", () => {
    const untheme = bootUntheme(theme);
    const resolved = resolveAll(untheme, { color: "dark", density: "compact" });
    expect(resolved.surface).toEqual(theme.tokens.black.$value);
    expect(resolved.gap).toEqual({ value: 4, unit: "px" });
    expect(untheme.config.input).toEqual({
      color: "light",
      density: "default",
    });
  });

  it("names the token and selection that fail to resolve", () => {
    const looped = mockTheme({
      tokens: { a: "{b}", b: "#fff" },
      modifiers: { color: { light: {}, dark: { b: "{a}" } } },
    });
    const untheme = bootUntheme(looped);
    expect(() => resolveAll(untheme, { color: "dark" })).toThrow(
      /"[ab]" fails to resolve at {"color":"dark"}/,
    );
    try {
      resolveAll(untheme, { color: "dark" });
    } catch (error) {
      expect((error as Error).cause).toBeInstanceOf(CircularAliasError);
    }
    expect(untheme.config.input).toEqual({ color: "light" });
  });
});

describe("proveTheme", () => {
  it("passes for a sound theme", () => {
    expect(() => proveTheme(theme)).not.toThrow();
    expect(() => proveTheme(theme, { exhaustive: true })).not.toThrow();
  });

  it("fails for a theme that violates the schema", () => {
    const broken = structuredClone(theme);
    broken.tokens.surface.$value = "{outline}";
    expect(() => proveTheme(broken)).toThrow(SchemaError);
  });

  it("fails for a theme a context makes circular", () => {
    const looped = mockTheme({
      tokens: { a: "{b}", b: "#fff" },
      modifiers: { color: { light: {}, dark: { b: "{a}" } } },
    });
    expect(() => proveTheme(looped)).toThrow(/"[ab]" fails to resolve/);
  });
});
