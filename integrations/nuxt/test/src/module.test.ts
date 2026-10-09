import type * as Kit from "@untheme/kit";
import type { NuxtUnthemeConfig } from "../../src/config";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { theme, input } from "../fixtures";

/**
 * The fixture packages that stand in for presets. Each maps an export subpath
 * to a fixture file. `@acme/preset` is a kit build. The others each break one
 * export.
 */
const preset = vi.hoisted(() => {
  const root = new URL("../fixtures/", import.meta.url);
  const sound = {
    config: "preset/config.mjs",
    manifest: "preset/manifest.mjs",
    layers: "preset/layers.mjs",
    "layers/bravo.json": "preset/layers/bravo.json",
    "layers/charlie.json": "preset/layers/charlie.json",
  };
  const packages: Record<string, Record<string, string>> = {
    "@acme/preset": sound,
    "@acme/no-config": { ...sound, config: "broken/config.mjs" },
    "@acme/no-manifest": { ...sound, manifest: "broken/manifest.mjs" },
    "@acme/no-layers": { ...sound, layers: "broken/layers.mjs" },
    "@acme/mismatch": {
      ...sound,
      layers: "broken/mismatch.mjs",
      "layers/bravo.json": "broken/layers/bravo.json",
    },
  };
  return {
    name: "@acme/preset",
    resolve: (id: string): string | undefined => {
      for (const [name, files] of Object.entries(packages)) {
        const file = id.startsWith(`${name}/`)
          ? files[id.slice(name.length + 1)]
          : undefined;
        if (file !== undefined) {
          return decodeURIComponent(new URL(file, root).pathname);
        }
      }
      return undefined;
    },
  };
});

const kit = vi.hoisted(() => ({
  addTemplate: vi.fn(),
  addPlugin: vi.fn(),
  addImports: vi.fn(),
  createResolver: vi.fn(() => ({ resolve: (p: string) => `/resolved${p}` })),
  tryResolveModule: vi.fn(async (id: string) => preset.resolve(id)),
}));

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: unknown) => def,
  ...kit,
}));

/*
 * The tests stub the loader and `resolveKit` of the kit. `resolveKit` answers
 * with the fixture theme under another id. This id shows that a theme comes
 * from the local build. The tests use the real `emit` of the kit.
 */
const built = vi.hoisted(() => ({ id: "built", layers: [] as unknown[] }));

vi.mock("@untheme/kit", async (original) => ({
  ...(await original<typeof Kit>()),
  loadConfig: vi.fn(async () => authored),
  resolveKit: vi.fn(async () => ({
    theme: { ...structuredClone(theme), id: built.id },
    input: structuredClone(input),
    layers: built.layers,
    outDir: "untheme",
    documents: ["/app/tokens/a.resolver.json", "/app/tokens/base.json"],
  })),
}));

import { emit, loadConfig, resolveKit } from "@untheme/kit";
import module from "../../src/module";
import { themes } from "../fixtures";

/** The kit config that the stubbed loader returns. */
const authored = { source: "./tokens/a.resolver.json" };

interface FakeNuxt {
  options: {
    rootDir: string;
    buildDir: string;
    watch: string[];
    css?: string[];
    _layers?: { config?: { untheme?: unknown } | null }[];
  };
  hook: ReturnType<typeof vi.fn>;
}

interface ModuleDef {
  meta: { name: string; configKey: string };
  setup: (options: NuxtUnthemeConfig, nuxt: FakeNuxt) => Promise<void>;
}
const mod = module as unknown as ModuleDef;

const options: NuxtUnthemeConfig = { theme, input };

/**
 * Returns the registered template with the filename, or `undefined` when no
 * template has that filename.
 */
const template = (filename: string) => {
  return kit.addTemplate.mock.calls
    .map(
      (
        call,
      ): { filename: string; write?: boolean; getContents: () => string } =>
        call[0],
    )
    .find((entry) => entry.filename === filename);
};

/**
 * Returns a named export parsed from the `untheme/config.mjs` build template.
 */
const exported = (name: string): unknown => {
  const content = template("untheme/config.mjs")!.getContents();
  const match = new RegExp(
    `export const ${name} = ([\\s\\S]*?);\\nexport `,
  ).exec(content);
  return JSON.parse(match![1]!);
};

let nuxt: FakeNuxt;

describe("untheme module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    built.layers = [];
    nuxt = {
      options: {
        rootDir: "/app",
        buildDir: "/app/.nuxt",
        watch: [],
      },
      hook: vi.fn(),
    };
  });

  /** The `untheme/layers.mjs` build template: the entries, parsed, and the code. */
  const served = () => {
    const code = template("untheme/layers.mjs")!.getContents();
    const match = /export const layers = ([\s\S]*?);\nexport default/.exec(
      code,
    );
    return { entries: JSON.parse(match![1]!) as unknown, code };
  };

  it("has the expected meta", () => {
    expect(mod.meta).toEqual({ name: "untheme", configKey: "untheme" });
  });

  describe("given a built contract", () => {
    it("uses it as passed, without building anything", async () => {
      await mod.setup(options, nuxt);
      expect(loadConfig).not.toHaveBeenCalled();
      expect(resolveKit).not.toHaveBeenCalled();
      expect(nuxt.options.watch).toEqual([]);
      expect(exported("theme")).toEqual(theme);
      expect(exported("input")).toEqual(input);
    });

    it("rejects a theme without its selection", async () => {
      await expect(mod.setup({ theme }, nuxt)).rejects.toThrow(
        /passed together/,
      );
    });

    it("rejects a selection without its theme", async () => {
      await expect(mod.setup({ input }, nuxt)).rejects.toThrow(
        /passed together/,
      );
    });

    it("rejects an initial selection outside the contract", async () => {
      await expect(
        mod.setup({ ...options, input: { color: "banana" } }, nuxt),
      ).rejects.toThrow();
    });
  });

  describe("given no contract", () => {
    it("builds the kit config in the project root", async () => {
      await mod.setup({}, nuxt);
      expect(loadConfig).toHaveBeenCalledWith("/app/untheme.config.ts");
      expect(resolveKit).toHaveBeenCalledWith(authored, { cwd: "/app" });
      expect((exported("theme") as { id: string }).id).toBe("built");
      expect(exported("input")).toEqual(input);
    });

    it("builds the kit config it is pointed at", async () => {
      await mod.setup({ config: "config/theme.ts" }, nuxt);
      expect(loadConfig).toHaveBeenCalledWith("/app/config/theme.ts");
    });

    it("watches the config and every document the build read", async () => {
      await mod.setup({}, nuxt);
      expect(nuxt.options.watch).toEqual([
        "/app/untheme.config.ts",
        "/app/tokens/a.resolver.json",
        "/app/tokens/base.json",
      ]);
    });

    it("watches the config even when it fails to load", async () => {
      vi.mocked(loadConfig).mockRejectedValueOnce(new Error("broken"));
      await expect(mod.setup({}, nuxt)).rejects.toThrow("broken");
      expect(nuxt.options.watch).toEqual(["/app/untheme.config.ts"]);
    });
  });

  it("adds an empty import map for a passed contract", async () => {
    await mod.setup(options, nuxt);
    const { entries, code } = served();
    expect(entries).toEqual([]);
    expect(code).toContain("export const load = {\n\n};");
    expect(template("untheme/layers.d.mts")!.getContents()).toContain(
      "export type LayerId = never;",
    );
  });

  describe("given a preset", () => {
    const options: NuxtUnthemeConfig = { preset: preset.name };

    it("takes the theme, selection, and manifest of the package", async () => {
      await mod.setup(options, nuxt);
      expect(loadConfig).not.toHaveBeenCalled();
      expect(resolveKit).not.toHaveBeenCalled();
      expect(nuxt.options.watch).toEqual([]);
      expect(exported("theme")).toEqual(theme);
      expect(exported("input")).toEqual(input);
      expect(template("untheme/manifest.mjs")!.getContents()).toContain(
        '"name": "Colour"',
      );
      expect(kit.tryResolveModule).toHaveBeenCalledWith(
        `${preset.name}/config`,
        new URL("file:///app/package.json"),
      );
    });

    it("re-exports the list of the package and imports each layer from it", async () => {
      await mod.setup(options, nuxt);
      const code = template("untheme/layers.mjs")!.getContents();
      expect(code).toContain(
        'export { layers, default } from "@acme/preset/layers";',
      );
      expect(code).toContain(
        '"charlie": () => import("@acme/preset/layers/charlie.json").then((m) => m.default),',
      );
      expect(code).not.toContain('"name": "Charlie"');
      expect(template("untheme/layers.mjs")!.write).toBe(true);
      expect(template("untheme/layers.d.mts")!.getContents()).toContain(
        'export { layers, default, type LayerId, type LayerEntry } from "@acme/preset/layers";',
      );
    });

    it("writes no layer file of its own", async () => {
      await mod.setup(options, nuxt);
      expect(template("untheme/layers/bravo.json")).toBeUndefined();
      expect(template("untheme/layers/charlie.json")).toBeUndefined();
    });

    it("names the missing export of a package that is not a preset", async () => {
      await expect(mod.setup({ preset: "@acme/tokens" }, nuxt)).rejects.toThrow(
        /the preset "@acme\/tokens" does not export "\.\/config"/,
      );
      await expect(mod.setup({ preset: "" }, nuxt)).rejects.toThrow(
        /`preset` must be a package name/,
      );
      await expect(
        mod.setup({ preset: 1 as unknown as string }, nuxt),
      ).rejects.toThrow(/`preset` must be a package name/);
    });

    it("names the export of a package that breaks the shape of a kit build", async () => {
      await expect(
        mod.setup({ preset: "@acme/no-config" }, nuxt),
      ).rejects.toThrow(
        /"@acme\/no-config\/config" must export the theme and input/,
      );
      await expect(
        mod.setup({ preset: "@acme/no-manifest" }, nuxt),
      ).rejects.toThrow(
        /"@acme\/no-manifest\/manifest" must export a manifest/,
      );
      await expect(
        mod.setup({ preset: "@acme/no-layers" }, nuxt),
      ).rejects.toThrow(
        /"@acme\/no-layers\/layers" must export a list of layers/,
      );
      await expect(
        mod.setup({ preset: "@acme/mismatch" }, nuxt),
      ).rejects.toThrow(
        /"@acme\/mismatch\/layers\/bravo.json" is not the layer "bravo"/,
      );
    });

    it("auto-imports useUnthemeCatalog", async () => {
      await mod.setup(options, nuxt);
      const imports = kit.addImports.mock.calls[0]?.[0];
      const names = imports.map((entry: { name: string }) => entry.name);
      expect(names).toContain("useUnthemeCatalog");
    });
  });

  it("writes the layers of a locally built config once and imports them", async () => {
    built.layers = [
      { entry: { id: "charlie", name: "Charlie" }, layer: themes.charlie },
    ];
    await mod.setup({}, nuxt);
    const { entries, code } = served();
    expect(entries).toEqual([{ id: "charlie", name: "Charlie" }]);
    expect(code).toContain(
      '"charlie": () => import("./layers/charlie.json").then((m) => m.default),',
    );
    const file = template("untheme/layers/charlie.json");
    expect(file!.write).toBe(true);
    expect(JSON.parse(file!.getContents())).toEqual(themes.charlie);
  });

  it("escapes quotes in generated context names", async () => {
    const odd = structuredClone(theme);
    Reflect.set(odd.modifiers.color, 'dar"k', odd.modifiers.color.dark);
    Reflect.deleteProperty(odd.modifiers.color, "dark");
    await mod.setup({ theme: odd, input }, nuxt);
    const types = template("untheme/index.d.mts");
    expect(types!.getContents()).toContain('"dar\\"k": Overrides');
  });

  it("registers a build template exporting the theme and selection", async () => {
    await mod.setup(options, nuxt);
    const build = template("untheme/config.mjs");
    expect(build).toBeDefined();
    const content = build!.getContents();
    expect(content).toContain("export const theme =");
    expect(content).toContain("export const input =");
    expect(content).not.toContain("export const themes =");
  });

  it("registers a declaration for the build template", async () => {
    await mod.setup(options, nuxt);
    const declaration = template("untheme/config.d.mts");
    expect(declaration).toBeDefined();
    const content = declaration!.getContents();
    expect(content).toContain("export declare const theme:");
    expect(content).toContain("export declare const input:");
  });

  it("writes the static cascade stylesheet inside the untheme layer", async () => {
    await mod.setup(options, nuxt);
    const stylesheet = template("untheme.css");
    expect(stylesheet).toBeDefined();
    expect(stylesheet!.write).toBe(true);
    const content = stylesheet!.getContents();
    expect(content.startsWith("@layer untheme {\n")).toBe(true);
    expect(content.endsWith("\n}")).toBe(true);
    expect(content).toContain(":root {");
    expect(content).toContain(" --white: #ffffff;");
    expect(content).toContain(" --surface: var(--white);");
    expect(content).toContain('[data-color="dark"] {');
    expect(content).toContain(" --primary: var(--indigo);");
  });

  it("renders the stylesheet from a locally built theme", async () => {
    await mod.setup({}, nuxt);
    expect(template("untheme.css")!.getContents()).toContain(
      " --surface: var(--white);",
    );
  });

  it("links the stylesheet into the app css", async () => {
    await mod.setup(options, nuxt);
    expect(nuxt.options.css).toEqual(["/app/.nuxt/untheme.css"]);
  });

  it("links the stylesheet before the css the app already carries", async () => {
    nuxt.options.css = ["~/assets/css/base.css"];
    await mod.setup(options, nuxt);
    expect(nuxt.options.css).toEqual([
      "/app/.nuxt/untheme.css",
      "~/assets/css/base.css",
    ]);
  });

  it("registers the key declarations with the token union and modifier structure", async () => {
    await mod.setup(options, nuxt);
    const types = template("untheme/index.d.mts");
    expect(types).toBeDefined();
    const content = types!.getContents();
    for (const symbol of ["export type Token =", "export type Mod ="]) {
      expect(content).toContain(symbol);
    }
  });

  it("registers the modules the kit emits, with the import map appended", async () => {
    await mod.setup(options, nuxt);
    for (const file of emit({ theme, input })) {
      const registered = template(`untheme/${file.path}`);
      expect(registered).toBeDefined();
      expect(registered!.write).toBe(true);
      if (file.path.startsWith("layers")) {
        expect(registered!.getContents().startsWith(file.contents)).toBe(true);
      } else {
        expect(registered!.getContents()).toBe(file.contents);
      }
    }
  });

  it("registers the runtime plugin", async () => {
    await mod.setup(options, nuxt);
    expect(kit.addPlugin).toHaveBeenCalledTimes(1);
    expect(kit.addPlugin.mock.calls[0]?.[0].src).toContain("runtime/plugin");
  });

  it("auto-imports useUntheme and useUnthemeRenderer", async () => {
    await mod.setup(options, nuxt);
    const imports = kit.addImports.mock.calls[0]?.[0];
    const names = imports.map((entry: { name: string }) => entry.name);
    expect(names).toContain("useUntheme");
    expect(names).toContain("useUnthemeRenderer");
  });

  describe("layered configs", () => {
    /**
     * The merged options that Nuxt passes to the module. The `order` list
     * has a duplicate.
     */
    const corrupted = {
      ...options,
      theme: { ...theme, order: ["color", "color"] },
    };

    it("takes the closest layer's config whole", async () => {
      const rebuilt = structuredClone(theme);
      rebuilt.id = "alpha-prime";
      rebuilt.tokens.primary.$value = "{indigo}";
      nuxt.options._layers = [
        { config: { untheme: { theme: rebuilt, input: { color: "dark" } } } },
        { config: { untheme: options } },
      ];
      await mod.setup(corrupted, nuxt);
      expect(exported("theme")).toEqual(rebuilt);
      expect(exported("input")).toEqual({ color: "dark" });
    });

    it("never merges a deeper layer's theme into the closest one", async () => {
      nuxt.options._layers = [
        { config: { untheme: { config: "theme.config.ts" } } },
        { config: { untheme: options } },
      ];
      await mod.setup(corrupted, nuxt);
      expect(loadConfig).toHaveBeenCalledWith("/app/theme.config.ts");
      expect((exported("theme") as { id: string }).id).toBe("built");
    });

    it("rejects a closest layer that passes half a contract", async () => {
      nuxt.options._layers = [
        { config: { untheme: { input: { color: "dark" } } } },
        { config: { untheme: options } },
      ];
      await expect(mod.setup(corrupted, nuxt)).rejects.toThrow(
        /passed together/,
      );
    });

    it("keeps the merged options when a single layer sets the config", async () => {
      nuxt.options._layers = [
        { config: { untheme: { ...options, input: { color: "dark" } } } },
        { config: {} },
        { config: null },
      ];
      await mod.setup(options, nuxt);
      expect(exported("input")).toEqual(input);
    });
  });
});
