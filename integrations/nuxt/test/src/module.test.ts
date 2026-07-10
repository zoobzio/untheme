import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UnthemeConfig } from "untheme/config";
import { theme, themes } from "../fixtures";

const kit = vi.hoisted(() => ({
  addTemplate: vi.fn(),
  addTypeTemplate: vi.fn(),
  addPlugin: vi.fn(),
  addImports: vi.fn(),
  createResolver: vi.fn(() => ({ resolve: (p: string) => `/resolved${p}` })),
}));

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: unknown) => def,
  ...kit,
}));

import module from "../../src/module";

interface ModuleDef {
  meta: { name: string; configKey: string };
  setup: (options: UnthemeConfig) => void;
}
const mod = module as unknown as ModuleDef;

const options: UnthemeConfig = {
  base: theme,
  themes,
  input: { color: "light" },
};

describe("untheme module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has the expected meta", () => {
    expect(mod.meta).toEqual({ name: "untheme", configKey: "untheme" });
  });

  it("fails plainly when no base theme is configured", () => {
    const missing = { ...options };
    Reflect.deleteProperty(missing, "base");
    expect(() => mod.setup(missing)).toThrow(/no base theme/);
  });

  it("rejects a catalog layer outside the contract", () => {
    const bad = {
      ...options,
      themes: { bad: { id: "bad", name: "Bad", tokens: { ghost: "{white}" } } },
    };
    expect(() => mod.setup(bad)).toThrow();
  });

  it("rejects an initial selection outside the contract", () => {
    expect(() =>
      mod.setup({ ...options, input: { color: "banana" } }),
    ).toThrow();
  });

  it("escapes quotes in generated context names", () => {
    const odd = structuredClone(theme);
    Reflect.set(odd.modifiers.color, 'dar"k', odd.modifiers.color.dark);
    Reflect.deleteProperty(odd.modifiers.color, "dark");
    mod.setup({ base: odd, themes: {}, input: { color: "light" } });
    const template = kit.addTypeTemplate.mock.calls[0][0];
    expect(template.getContents()).toContain('"dar\\"k": Overrides');
  });

  it("registers a build template exporting theme, themes, and input", () => {
    mod.setup(options);
    expect(kit.addTemplate).toHaveBeenCalledTimes(2);
    const template = kit.addTemplate.mock.calls[0][0];
    expect(template.filename).toBe("untheme.mjs");
    expect(template.write).toBe(true);
    const content = template.getContents();
    expect(content).toContain("export const theme =");
    expect(content).toContain("export const themes =");
    expect(content).toContain("export const input =");
  });

  it("registers a declaration for the build template", () => {
    mod.setup(options);
    const template = kit.addTemplate.mock.calls[1][0];
    expect(template.filename).toBe("untheme.d.mts");
    const content = template.getContents();
    expect(content).toContain("export const theme:");
    expect(content).toContain("export const themes:");
  });

  it("registers a type template with the token union and modifier structure", () => {
    mod.setup(options);
    const template = kit.addTypeTemplate.mock.calls[0][0];
    expect(template.filename).toBe("types/untheme.d.ts");
    const content = template.getContents();
    for (const symbol of ["export type Token =", "export type Mod ="]) {
      expect(content).toContain(symbol);
    }
  });

  it("registers the runtime plugin", () => {
    mod.setup(options);
    expect(kit.addPlugin).toHaveBeenCalledTimes(1);
    expect(kit.addPlugin.mock.calls[0][0].src).toContain("runtime/plugin");
  });

  it("auto-imports useUntheme", () => {
    mod.setup(options);
    const imports = kit.addImports.mock.calls[0][0];
    const names = imports.map((entry: { name: string }) => entry.name);
    expect(names).toContain("useUntheme");
  });
});
