import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Schema, Template } from "@untheme/schema";

import { defineSchema } from "@untheme/schema";

import { build, defineConfig, generate } from "../src/build";
import {
  InvalidConfigError,
  MalformedConfigError,
  MissingConfigError,
} from "../src/error";
import { loadConfig } from "../src/load";
import { resolveKit } from "../src/resolve";
import { writeOutput } from "../src/write";
import { FIXTURES } from "./helpers";

/** The fixtures directory, as the project root of the generate tests. */
const ROOT = fileURLToPath(FIXTURES);

/** Where the emitted modules are written to be imported back. */
const OUT = new URL("./.generated/emit/", import.meta.url);

afterAll(async () => {
  await rm(OUT, { recursive: true, force: true });
});

/** The fixture resolver, as an absolute path a temp project can point at. */
const RESOLVER = fileURLToPath(new URL("resolver.json", FIXTURES));

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "untheme-kit-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const config = async (body: string, name = "untheme.config.ts") => {
  await writeFile(join(root, name), body);
};

describe("defineConfig", () => {
  it("returns the config it is given", () => {
    const authored = { source: "./tokens.resolver.json" };
    expect(defineConfig(authored)).toBe(authored);
  });
});

describe("loadConfig", () => {
  it("loads the default export of a TypeScript config", async () => {
    await config(
      `const source: string = ${JSON.stringify(RESOLVER)};\nexport default { source, name: "Loaded" };\n`,
    );
    await expect(loadConfig(join(root, "untheme.config.ts"))).resolves.toEqual({
      source: RESOLVER,
      name: "Loaded",
    });
  });

  it("throws when there is no file", async () => {
    await expect(loadConfig(join(root, "untheme.config.ts"))).rejects.toThrow(
      MissingConfigError,
    );
  });

  it("throws when the default export is not a config", async () => {
    await config("export default { tokens: {} };\n");
    await expect(loadConfig(join(root, "untheme.config.ts"))).rejects.toThrow(
      MalformedConfigError,
    );
  });
});

describe("build", () => {
  it("writes the modules and a manifest under the output directory", async () => {
    await config(`export default { source: ${JSON.stringify(RESOLVER)} };\n`);
    const output = await build({ root });
    expect(output.outDir).toBe("untheme");
    const written = (await readdir(join(root, "untheme"))).sort();
    expect(written).toEqual([
      ".untheme.json",
      "config.d.mts",
      "config.mjs",
      "index.d.mts",
      "index.mjs",
      "layers",
      "layers.d.mts",
      "layers.mjs",
      "manifest.d.mts",
      "manifest.mjs",
    ]);
    const manifest = JSON.parse(
      await readFile(join(root, "untheme", ".untheme.json"), "utf8"),
    );
    expect(manifest.files).toEqual(output.files.map((file) => file.path));
  });

  it("builds the config it is pointed at, with relative sources", async () => {
    await writeFile(
      join(root, "tokens.json"),
      JSON.stringify({ gap: { $type: "number", $value: 4 } }),
    );
    await config(
      'export default { source: "./tokens.json", name: "Gap", outDir: "src/theme" };\n',
      "theme.config.ts",
    );
    await build({ root, config: "theme.config.ts" });
    const theme = await readFile(join(root, "src/theme/config.mjs"), "utf8");
    expect(theme).toContain('"id": "gap"');
  });

  it("rejects an invalid config", async () => {
    await config(
      `export default { source: ${JSON.stringify(RESOLVER)}, outDir: "/abs" };\n`,
    );
    await expect(build({ root })).rejects.toThrow(InvalidConfigError);
  });
});

describe("writeOutput", () => {
  it("removes files the previous write produced and this one does not", async () => {
    await writeOutput(
      {
        outDir: "out",
        files: [
          { path: "a.mjs", contents: "a" },
          { path: "b.mjs", contents: "b" },
        ],
      },
      root,
    );
    await writeFile(join(root, "out", "authored.ts"), "mine");
    await writeOutput(
      { outDir: "out", files: [{ path: "a.mjs", contents: "a2" }] },
      root,
    );
    const written = (await readdir(join(root, "out"))).sort();
    expect(written).toEqual([".untheme.json", "a.mjs", "authored.ts"]);
    expect(await readFile(join(root, "out", "a.mjs"), "utf8")).toBe("a2");
  });

  it("leaves alone a manifest entry that reaches outside the directory", async () => {
    await writeFile(join(root, "keep.txt"), "keep");
    await writeOutput({ outDir: "out", files: [] }, root);
    await writeFile(
      join(root, "out", ".untheme.json"),
      JSON.stringify({ files: ["../keep.txt", 7] }),
    );
    await writeOutput({ outDir: "out", files: [] }, root);
    expect(await readFile(join(root, "keep.txt"), "utf8")).toBe("keep");
  });

  it("treats an unreadable manifest as empty", async () => {
    await writeOutput({ outDir: "out", files: [] }, root);
    await writeFile(join(root, "out", ".untheme.json"), "{not json");
    await expect(
      writeOutput({ outDir: "out", files: [] }, root),
    ).resolves.toBeUndefined();
  });
});

describe("generate", () => {
  it("emits the index, config, manifest and layers modules with declarations", async () => {
    const output = await generate({ source: "./resolver.json" }, { cwd: ROOT });
    expect(output.outDir).toBe("untheme");
    expect(output.files.map((file) => file.path)).toEqual([
      "index.mjs",
      "index.d.mts",
      "config.mjs",
      "config.d.mts",
      "manifest.mjs",
      "manifest.d.mts",
      "layers/fixture.json",
      "layers.mjs",
      "layers.d.mts",
    ]);
    for (const file of output.files.filter((f) => !f.path.endsWith(".json"))) {
      expect(
        file.contents.startsWith(
          '// Generated by @untheme/kit from "fixture". Do not edit by hand.\n',
        ),
      ).toBe(true);
    }
  });

  it("declares explicit unions for the tokens, modifiers and contexts", async () => {
    const output = await generate({ source: "./resolver.json" }, { cwd: ROOT });
    const declarations = output.files.find(
      (file) => file.path === "index.d.mts",
    )!.contents;
    expect(declarations).toContain('\n  | "color.primary.600"');
    expect(declarations).toContain(
      'export type Modifier =\n  | "color"\n  | "density";',
    );
    expect(declarations).toContain(
      [
        "export type Mod = {",
        '  "color": { "light": Overrides; "dark": Overrides };',
        '  "density": { "default": Overrides; "compact": Overrides };',
        "};",
      ].join("\n"),
    );

    const config = output.files.find(
      (file) => file.path === "config.d.mts",
    )!.contents;
    expect(config).toContain(
      "export type Contract = UnthemeContract<Token, Mod>;",
    );
    expect(config).toContain("declare const config: UnthemeConfig<Contract>;");
  });

  it("declares only the contexts the config keeps", async () => {
    const output = await generate(
      {
        source: "./resolver.json",
        modifiers: { color: { contexts: ["dark"] } },
      },
      { cwd: ROOT },
    );
    const declarations = output.files.find(
      (file) => file.path === "index.d.mts",
    )!.contents;
    expect(declarations).toContain('  "color": { "dark": Overrides };');
    const index = output.files.find((file) => file.path === "index.mjs")!;
    expect(index.contents).not.toContain('"light"');
  });

  it("emits the manifest of the contexts the config keeps", async () => {
    const output = await generate(
      {
        source: "./resolver.json",
        modifiers: {
          color: { add: { dim: "./dim.json" }, contexts: ["dim", "dark"] },
          density: false,
        },
      },
      { cwd: ROOT },
    );
    const module = output.files.find((file) => file.path === "manifest.mjs")!;
    const literal = module.contents
      .split("export const manifest = ")[1]!
      .split(";\nexport default")[0]!;
    expect(JSON.parse(literal)).toEqual([
      {
        id: "color",
        name: "Color",
        contexts: [
          { id: "dim", name: "Dim" },
          { id: "dark", name: "Dark" },
        ],
      },
    ]);
    const declarations = output.files.find(
      (file) => file.path === "manifest.d.mts",
    )!.contents;
    expect(declarations).toContain(
      "export declare const manifest: readonly ModifierEntry[];",
    );
  });

  it("emits the base as the only layer without configured layers", async () => {
    const output = await generate({ source: "./resolver.json" }, { cwd: ROOT });
    const module = output.files.find((file) => file.path === "layers.mjs")!;
    const literal = module.contents
      .split("export const layers = ")[1]!
      .split(";\nexport default")[0]!;
    expect(JSON.parse(literal)).toEqual([{ id: "fixture", name: "Fixture" }]);
    const declarations = output.files.find(
      (file) => file.path === "layers.d.mts",
    )!.contents;
    expect(declarations).toContain('export type LayerId =\n  | "fixture";');
    expect(declarations).not.toContain("never");
    expect(declarations).toContain(
      "export declare const layers: readonly LayerEntry[];",
    );
  });

  it("emits a never union and an empty structure without modifiers", async () => {
    const output = await generate(
      { source: "./base.json", name: "Base" },
      { cwd: ROOT },
    );
    const declarations = output.files.find(
      (file) => file.path === "index.d.mts",
    )!.contents;
    expect(declarations).toContain("export type Modifier = never;");
    expect(declarations).toContain("export type Mod = {};");
  });

  it("emits modules that import back to the resolved documents", async () => {
    const kit = await resolveKit({ source: "./resolver.json" }, { cwd: ROOT });
    const output = await generate({ source: "./resolver.json" }, { cwd: ROOT });
    await mkdir(new URL("layers/", OUT), { recursive: true });
    await writeFile(new URL("../.gitignore", OUT), "*\n");
    for (const file of output.files) {
      await writeFile(new URL(file.path, OUT), file.contents);
    }

    const keys = await import(
      pathToFileURL(fileURLToPath(new URL("index.mjs", OUT))).href
    );
    expect(keys.tokens).toEqual(Object.keys(kit.theme.tokens));
    expect(keys.modifiers).toEqual({
      color: ["light", "dark"],
      density: ["default", "compact"],
    });
    expect(keys.isToken("size.md")).toBe(true);
    expect(keys.isToken("size.xl")).toBe(false);
    expect(keys.isToken(7)).toBe(false);
    expect(keys.isModifier("density")).toBe(true);
    expect(keys.isModifier("toString")).toBe(false);

    const config = await import(new URL("config.mjs", OUT).href);
    expect(config.theme).toEqual(kit.theme);
    expect(config.input).toEqual(kit.input);
    expect(config.default).toEqual({ theme: kit.theme, input: kit.input });
    const schema: Schema<Template> = defineSchema(config.theme);
    schema.assert.theme(config.theme);
    schema.assert.input(config.input);
  });
});
