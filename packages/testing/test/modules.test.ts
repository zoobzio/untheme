import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { emit } from "@untheme/kit";
import { useUnthemeConfig } from "untheme/config";

import { mockKit } from "../src/kit";
import { mockConfig, mockIndex, mockModules } from "../src/modules";
import { mockTheme } from "../src/theme";

const theme = mockTheme({
  id: "app",
  name: "App",
  tokens: { white: "#fff", black: "#000", surface: "{white}" },
  modifiers: {
    color: { light: {}, dark: { surface: "{black}" } },
    density: { default: {}, compact: {} },
  },
});

/**
 * The modules that the kit emits for the theme, written to disk and imported
 * back. The tests check the mocks against the real output of the kit, not
 * against a description of it.
 */
let emitted: {
  index: Record<string, unknown>;
  config: Record<string, unknown>;
  manifest: Record<string, unknown>;
};
let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "untheme-testing-"));
  const kit = mockKit(theme, { selection: { density: "compact" } });
  for (const file of emit(kit)) {
    await writeFile(join(dir, file.path), file.contents);
  }
  const load = async (name: string) =>
    (await import(pathToFileURL(join(dir, name)).href)) as Record<
      string,
      unknown
    >;
  emitted = {
    index: await load("index.mjs"),
    config: await load("config.mjs"),
    manifest: await load("manifest.mjs"),
  };
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("mockIndex", () => {
  it("lists the tokens and the contexts of each modifier, frozen", () => {
    const index = mockIndex(theme);
    expect(index.tokens).toEqual(["white", "black", "surface"]);
    expect(index.modifiers).toEqual({
      color: ["light", "dark"],
      density: ["default", "compact"],
    });
    expect(Object.isFrozen(index.tokens)).toBe(true);
    expect(Object.isFrozen(index.modifiers)).toBe(true);
    expect(Object.isFrozen(index.modifiers.color)).toBe(true);
  });

  it("guards tokens and modifiers", () => {
    const index = mockIndex(theme);
    expect(index.isToken("surface")).toBe(true);
    expect(index.isToken("outline")).toBe(false);
    expect(index.isToken(1)).toBe(false);
    expect(index.isModifier("color")).toBe(true);
    expect(index.isModifier("toString")).toBe(false);
  });

  it("matches the index module the kit emits", () => {
    const index = mockIndex(theme);
    expect(emitted.index.tokens).toEqual(index.tokens);
    expect(emitted.index.modifiers).toEqual(index.modifiers);
    const guards = emitted.index as {
      isToken: (v: unknown) => boolean;
      isModifier: (v: unknown) => boolean;
    };
    for (const value of ["surface", "outline", "color", 1]) {
      expect(guards.isToken(value)).toBe(index.isToken(value));
      expect(guards.isModifier(value)).toBe(index.isModifier(value));
    }
  });
});

describe("mockConfig", () => {
  it("carries the theme and a boot selection, named and as the default", () => {
    const config = mockConfig(theme, { density: "compact" });
    expect(config.theme).toBe(theme);
    expect(config.input).toEqual({ color: "light", density: "compact" });
    expect(config.default).toEqual({ theme, input: config.input });
  });

  it("matches the config module the kit emits", () => {
    const config = mockConfig(theme, { density: "compact" });
    expect(emitted.config.theme).toEqual(config.theme);
    expect(emitted.config.input).toEqual(config.input);
    expect(emitted.config.default).toEqual(config.default);
  });

  it("seeds a container through useUnthemeConfig", () => {
    const container = useUnthemeConfig(mockConfig(theme));
    expect(container.input).toEqual({ color: "light", density: "default" });
    expect(container.patch).toEqual({});
  });
});

describe("mockModules", () => {
  it("is the three modules a build writes", () => {
    const modules = mockModules(theme, {
      selection: { density: "compact" },
      prose: { color: { name: "Color scheme" } },
    });
    expect(modules.index.tokens).toEqual(mockIndex(theme).tokens);
    expect(modules.config.input).toEqual({
      color: "light",
      density: "compact",
    });
    expect(modules.manifest.manifest[0]?.name).toBe("Color scheme");
    expect(modules.manifest.default).toBe(modules.manifest.manifest);
  });

  it("matches the manifest module the kit emits", () => {
    const modules = mockModules(theme);
    expect(emitted.manifest.manifest).toEqual(modules.manifest.manifest);
    expect(emitted.manifest.default).toEqual(modules.manifest.default);
  });
});
