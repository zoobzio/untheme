import type { NuxtUnthemeConfig } from "../../src/config";

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { theme, themes, input } from "../fixtures";

const kit = vi.hoisted(() => ({
  addTemplate: vi.fn(),
  addTypeTemplate: vi.fn(),
  addPlugin: vi.fn(),
  addImports: vi.fn(),
  addServerHandler: vi.fn(),
  createResolver: vi.fn(() => ({ resolve: (p: string) => `/resolved${p}` })),
}));

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: unknown) => def,
  ...kit,
}));

import module from "../../src/module";

interface FakeNuxt {
  options: {
    buildDir: string;
    nitro: { serverAssets?: { baseName: string; dir: string }[] };
  };
  hook: ReturnType<typeof vi.fn>;
}

interface ModuleDef {
  meta: { name: string; configKey: string };
  setup: (options: NuxtUnthemeConfig, nuxt: FakeNuxt) => void;
}
const mod = module as unknown as ModuleDef;

const options: NuxtUnthemeConfig = { theme, themes, input };

/**
 * The registered template carrying the filename, or undefined when none
 * was registered under it.
 */
const template = (filename: string) => {
  return kit.addTemplate.mock.calls
    .map((call): { filename: string; getContents: () => string } => call[0])
    .find((entry) => entry.filename === filename);
};

let nuxt: FakeNuxt;

/**
 * Fires the hooks the module registered under `build:before` — the point
 * where it writes the catalog JSON, after nuxt has cleared the build
 * directory.
 */
const build = async () => {
  for (const [name, callback] of nuxt.hook.mock.calls) {
    if (name === "build:before") {
      await callback();
    }
  }
};

describe("untheme module", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    nuxt = {
      options: {
        buildDir: await mkdtemp(join(tmpdir(), "untheme-module-")),
        nitro: {},
      },
      hook: vi.fn(),
    };
  });

  afterEach(async () => {
    await rm(nuxt.options.buildDir, { recursive: true, force: true });
  });

  it("has the expected meta", () => {
    expect(mod.meta).toEqual({ name: "untheme", configKey: "untheme" });
  });

  it("fails plainly when no base theme is configured", () => {
    const missing = { ...options };
    Reflect.deleteProperty(missing, "theme");
    expect(() => mod.setup(missing, nuxt)).toThrow(/no base theme/);
  });

  it("rejects a catalog layer outside the contract", () => {
    const bad = {
      ...options,
      themes: { bad: { id: "bad", name: "Bad", tokens: { ghost: "{white}" } } },
    };
    expect(() => mod.setup(bad, nuxt)).toThrow();
  });

  it("rejects duplicate theme ids in the catalog", () => {
    const dupes = {
      ...options,
      themes: {
        one: { id: "bravo", name: "Bravo" },
        two: { id: "bravo", name: "Encore" },
      },
    };
    expect(() => mod.setup(dupes, nuxt)).toThrow(/duplicate theme id/);
  });

  it("rejects an initial selection outside the contract", () => {
    expect(() =>
      mod.setup({ ...options, input: { color: "banana" } }, nuxt),
    ).toThrow();
  });

  it("writes the catalog manifest and payloads on build:before", async () => {
    mod.setup(options, nuxt);
    await build();
    const dir = join(nuxt.options.buildDir, "untheme");

    const entries: unknown = JSON.parse(
      await readFile(join(dir, "entries.json"), "utf8"),
    );
    expect(entries).toEqual([
      { id: "bravo", name: "Bravo" },
      { id: "charlie", name: "Charlie" },
    ]);

    const payloads: unknown = JSON.parse(
      await readFile(join(dir, "themes.json"), "utf8"),
    );
    expect(payloads).toEqual({
      bravo: themes.bravo,
      charlie: themes.charlie,
    });
  });

  it("writes an empty catalog when no themes are configured", async () => {
    const bare = { ...options };
    Reflect.deleteProperty(bare, "themes");
    mod.setup(bare, nuxt);
    await build();

    const entries: unknown = JSON.parse(
      await readFile(
        join(nuxt.options.buildDir, "untheme", "entries.json"),
        "utf8",
      ),
    );
    expect(entries).toEqual([]);
  });

  it("mounts the catalog directory as a nitro server asset", () => {
    mod.setup(options, nuxt);
    expect(nuxt.options.nitro.serverAssets).toEqual([
      {
        baseName: "untheme",
        dir: join(nuxt.options.buildDir, "untheme"),
      },
    ]);
  });

  it("registers the catalog's listing and retrieval routes", () => {
    mod.setup(options, nuxt);
    const handlers = kit.addServerHandler.mock.calls.map((call) => call[0]);
    expect(handlers).toEqual([
      {
        route: "/api/untheme/themes",
        method: "get",
        handler: "/resolved./runtime/server/list",
      },
      {
        route: "/api/untheme/themes/:id",
        method: "get",
        handler: "/resolved./runtime/server/get",
      },
    ]);
  });

  it("escapes quotes in generated context names", () => {
    const odd = structuredClone(theme);
    Reflect.set(odd.modifiers.color, 'dar"k', odd.modifiers.color.dark);
    Reflect.deleteProperty(odd.modifiers.color, "dark");
    mod.setup({ theme: odd, input }, nuxt);
    const types = kit.addTypeTemplate.mock.calls[0]?.[0];
    expect(types.getContents()).toContain('"dar\\"k": Overrides');
  });

  it("registers a build template exporting the theme and selection", () => {
    mod.setup(options, nuxt);
    const build = template("untheme.mjs");
    expect(build).toBeDefined();
    const content = build!.getContents();
    expect(content).toContain("export const theme =");
    expect(content).toContain("export const input =");
    expect(content).not.toContain("export const themes =");
  });

  it("registers a declaration for the build template", () => {
    mod.setup(options, nuxt);
    const declaration = template("untheme.d.mts");
    expect(declaration).toBeDefined();
    const content = declaration!.getContents();
    expect(content).toContain("export const theme:");
    expect(content).toContain("export const input:");
  });

  it("registers a type template with the token union and modifier structure", () => {
    mod.setup(options, nuxt);
    const types = kit.addTypeTemplate.mock.calls[0]?.[0];
    expect(types.filename).toBe("types/untheme.d.ts");
    const content = types.getContents();
    for (const symbol of ["export type Token =", "export type Mod ="]) {
      expect(content).toContain(symbol);
    }
  });

  it("registers the runtime plugin", () => {
    mod.setup(options, nuxt);
    expect(kit.addPlugin).toHaveBeenCalledTimes(1);
    expect(kit.addPlugin.mock.calls[0]?.[0].src).toContain("runtime/plugin");
  });

  it("auto-imports useUntheme", () => {
    mod.setup(options, nuxt);
    const imports = kit.addImports.mock.calls[0]?.[0];
    const names = imports.map((entry: { name: string }) => entry.name);
    expect(names).toContain("useUntheme");
  });
});
