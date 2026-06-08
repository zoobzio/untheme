import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Nuxt, ModuleDefinition } from "@nuxt/schema";
import type { NuxtUnthemeConfig } from "../../src/types";

type ModuleDef = ModuleDefinition<
  NuxtUnthemeConfig,
  Partial<NuxtUnthemeConfig>,
  false
>;

const kit = vi.hoisted(() => ({
  addTemplate: vi.fn(),
  addTypeTemplate: vi.fn(),
  addPlugin: vi.fn(),
  addImports: vi.fn(),
  createResolver: vi.fn(() => ({
    resolve: (p: string) => `/resolved${p}`,
  })),
  useNuxt: vi.fn(() => ({
    options: { srcDir: "/project", dir: { public: "public" } },
  })),
}));

const fs = vi.hoisted(() => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: ModuleDef) => def,
  ...kit,
}));

vi.mock("fs", () => fs);

import module from "../../src/module";
const mod = module as unknown as ModuleDef;

const baseConfig: NuxtUnthemeConfig = {
  preset: "m3",
  theme: "dracula",
  extend: {},
};

const setup = (options: NuxtUnthemeConfig = baseConfig) =>
  mod.setup!(options, {} as Nuxt);

describe("untheme nuxt module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has correct meta", () => {
    expect(mod.meta).toEqual({
      name: "untheme",
      configKey: "untheme",
    });
  });

  it("throws when the preset is unknown", () => {
    expect(() =>
      setup({ ...baseConfig, preset: "missing" as never }),
    ).toThrow("Invalid preset");
  });

  it("throws when the theme is not in the preset", () => {
    expect(() => setup({ ...baseConfig, theme: "missing" })).toThrow(
      "Invalid theme",
    );
  });

  it("registers a build template", () => {
    setup();
    expect(kit.addTemplate).toHaveBeenCalledTimes(1);
    const call = kit.addTemplate.mock.calls[0][0];
    expect(call.filename).toBe("untheme.mjs");
    expect(call.write).toBe(true);
    expect(typeof call.getContents).toBe("function");
  });

  it("registers a type template", () => {
    setup();
    expect(kit.addTypeTemplate).toHaveBeenCalledTimes(1);
    const call = kit.addTypeTemplate.mock.calls[0][0];
    expect(call.filename).toBe("types/untheme.d.ts");
  });

  it("registers a plugin", () => {
    setup();
    expect(kit.addPlugin).toHaveBeenCalledTimes(1);
  });

  it("registers auto-imports", () => {
    setup();
    expect(kit.addImports).toHaveBeenCalledTimes(1);
    const imports = kit.addImports.mock.calls[0][0] as Array<{
      name: string;
      from: string;
    }>;
    const names = imports.map((i) => i.name);
    expect(names).toContain("useTheme");
    expect(names).not.toContain("accessTheme");
  });

  it("writes the public theme files", () => {
    setup();
    expect(fs.mkdirSync).toHaveBeenCalled();
    const files = fs.writeFileSync.mock.calls.map((c) => c[0]);
    expect(files.some((f: string) => f.endsWith("options.json"))).toBe(true);
    expect(files.some((f: string) => f.endsWith("dracula.json"))).toBe(true);
  });

  it("generates a build template exporting theme data", () => {
    setup();
    const getContents = kit.addTemplate.mock.calls[0][0]
      .getContents as () => string;
    const content = getContents();
    expect(content).toContain("export const theme =");
    expect(content).toContain("export const extend =");
    expect(content).toContain("export const options =");
    expect(content).toContain("export const ref =");
    expect(content).toContain("export const sys =");
    expect(content).toContain("export const role =");
  });

  it("generates a type template deriving token types", () => {
    setup();
    const getContents = kit.addTypeTemplate.mock.calls[0][0]
      .getContents as () => string;
    const content = getContents();
    expect(content).toContain("ReferenceToken");
    expect(content).toContain("SystemToken");
    expect(content).toContain("RoleToken");
  });
});
