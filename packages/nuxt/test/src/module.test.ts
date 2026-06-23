import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NuxtUnthemeConfig } from "../../src/types";
import { theme } from "../fixtures";

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
  setup: (options: NuxtUnthemeConfig) => void;
}
const mod = module as unknown as ModuleDef;

const options: NuxtUnthemeConfig = {
  base: theme,
  themes: { alpha: theme, bravo: theme },
};

describe("untheme module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has the expected meta", () => {
    expect(mod.meta).toEqual({ name: "untheme", configKey: "untheme" });
  });

  it("registers a build template exporting theme and themes", () => {
    mod.setup(options);
    expect(kit.addTemplate).toHaveBeenCalledTimes(1);
    const template = kit.addTemplate.mock.calls[0][0];
    expect(template.filename).toBe("untheme.mjs");
    expect(template.write).toBe(true);
    const content = template.getContents();
    expect(content).toContain("export const theme =");
    expect(content).toContain("export const themes =");
  });

  it("registers a type template with the token and key unions", () => {
    mod.setup(options);
    const template = kit.addTypeTemplate.mock.calls[0][0];
    expect(template.filename).toBe("types/untheme.d.ts");
    const content = template.getContents();
    for (const union of [
      "ReferenceToken",
      "SystemToken",
      "RoleToken",
      "ThemeKey",
    ]) {
      expect(content).toContain(union);
    }
    expect(content).toContain('"alpha" | "bravo"');
  });

  it("registers the runtime plugin and the server cookie plugin", () => {
    mod.setup(options);
    expect(kit.addPlugin).toHaveBeenCalledTimes(2);
    const modes = kit.addPlugin.mock.calls.map((call) => call[0].mode);
    expect(modes).toContain("server");
  });

  it("auto-imports useUntheme", () => {
    mod.setup(options);
    const imports = kit.addImports.mock.calls[0][0];
    const names = imports.map((entry: { name: string }) => entry.name);
    expect(names).toContain("useUntheme");
  });
});
