import type * as Kit from "@untheme/kit";
import type { NuxtUnthemeConfig } from "../../src/config";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { theme, input } from "../fixtures";

const kit = vi.hoisted(() => ({
  addTemplate: vi.fn(),
  addPlugin: vi.fn(),
  addImports: vi.fn(),
  addServerHandler: vi.fn(),
  createResolver: vi.fn(() => ({ resolve: (p: string) => `/resolved${p}` })),
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
const built = vi.hoisted(() => ({ id: "built" }));

vi.mock("@untheme/kit", async (original) => ({
  ...(await original<typeof Kit>()),
  loadConfig: vi.fn(async () => authored),
  resolveKit: vi.fn(async () => ({
    theme: { ...structuredClone(theme), id: built.id },
    input: structuredClone(input),
    outDir: "untheme",
    documents: ["/app/tokens/a.resolver.json", "/app/tokens/base.json"],
  })),
}));

import { emit, loadConfig, resolveKit } from "@untheme/kit";
import module from "../../src/module";

/** The kit config that the stubbed loader returns. */
const authored = { source: "./tokens/a.resolver.json" };

interface FakeNuxt {
  options: {
    rootDir: string;
    buildDir: string;
    watch: string[];
    css?: string[];
    nitro: { serverAssets?: unknown[] };
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
    nuxt = {
      options: {
        rootDir: "/app",
        buildDir: "/app/.nuxt",
        watch: [],
        nitro: {},
      },
      hook: vi.fn(),
    };
  });

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

  it("registers no server routes and no server assets", async () => {
    await mod.setup(options, nuxt);
    expect(kit.addServerHandler).not.toHaveBeenCalled();
    expect(nuxt.options.nitro.serverAssets).toBeUndefined();
    expect(nuxt.hook).not.toHaveBeenCalled();
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

  it("does not link the stylesheet into the app css", async () => {
    await mod.setup(options, nuxt);
    expect(nuxt.options.css).toBeUndefined();
  });

  it("leaves css the app already carries as it is", async () => {
    nuxt.options.css = ["~/assets/css/base.css"];
    await mod.setup(options, nuxt);
    expect(nuxt.options.css).toEqual(["~/assets/css/base.css"]);
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

  it("registers exactly the modules the kit emits", async () => {
    await mod.setup(options, nuxt);
    for (const file of emit({ theme, input })) {
      const registered = template(`untheme/${file.path}`);
      expect(registered).toBeDefined();
      expect(registered!.write).toBe(true);
      expect(registered!.getContents()).toBe(file.contents);
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
