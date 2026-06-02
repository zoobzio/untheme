import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Nuxt, ModuleDefinition } from "@nuxt/schema";
import type { NuxtUnthemeConfig } from "../../src/module";
import { moduleOptions } from "../fixtures";

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
  addServerHandler: vi.fn(),
  createResolver: vi.fn(() => ({
    resolve: (p: string) => `/resolved${p}`,
  })),
  useLogger: vi.fn(() => ({
    fatal: vi.fn(),
  })),
}));

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: ModuleDef) => def,
  ...kit,
}));

import module from "../../src/module";
const mod = module as unknown as ModuleDef;

const setup = (options = moduleOptions()) => mod.setup!(options, {} as Nuxt);

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

  it("throws when default theme key is invalid", () => {
    expect(() => setup(moduleOptions({ default: "missing" }))).toThrow(
      "Invalid default theme",
    );
  });

  it("calls useLogger().fatal on invalid theme", () => {
    const logger = { fatal: vi.fn() };
    kit.useLogger.mockReturnValueOnce(logger);
    expect(() =>
      setup(moduleOptions({ default: "bad", themes: {} })),
    ).toThrow();
    expect(logger.fatal).toHaveBeenCalledWith("bad is not a valid theme.");
  });

  it("registers a build template", () => {
    setup();
    expect(kit.addTemplate).toHaveBeenCalledTimes(1);
    const call = kit.addTemplate.mock.calls[0][0];
    expect(call.filename).toBe("untheme.config.mjs");
    expect(call.write).toBe(true);
    expect(typeof call.getContents).toBe("function");
  });

  it("registers a type template", () => {
    setup();
    expect(kit.addTypeTemplate).toHaveBeenCalledTimes(1);
    const call = kit.addTypeTemplate.mock.calls[0][0];
    expect(call.filename).toBe("types/untheme.d.ts");
  });

  it("registers a server handler", () => {
    setup();
    expect(kit.addServerHandler).toHaveBeenCalledTimes(1);
    expect(kit.addServerHandler.mock.calls[0][0].route).toBe(
      "/api/theme/:theme",
    );
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
    expect(names).not.toContain("AppTheme");
  });

  it("extracts token keys from the default theme", () => {
    setup();
    const getContents = kit.addTypeTemplate.mock.calls[0][0]
      .getContents as () => string;
    const content = getContents();
    expect(content).toContain("white");
    expect(content).toContain("primary");
    expect(content).toContain("text-color");
  });

  it("generates template content with correct exports", () => {
    setup();
    const getContents = kit.addTemplate.mock.calls[0][0]
      .getContents as () => string;
    const content = getContents();
    expect(content).toContain('"alpha"');
    expect(content).toContain('"Alpha"');
  });
});
