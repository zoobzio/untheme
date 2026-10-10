import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { generate } from "../src/build";
import { portable, readPreset } from "../src/preset";
import { resolveKit } from "../src/resolve";
import { bare, designate, isPreset, loader, packageName } from "../src/source";
import { FIXTURES } from "./helpers";

/** The fixture package `@acme/tokens`, as a project root and as a preset. */
const PROJECT = new URL("project/", FIXTURES);
const ROOT = fileURLToPath(PROJECT);

describe("bare", () => {
  it("is true for a package with no path", () => {
    for (const href of [
      "npm:/@untheme/aurora",
      "npm:/@untheme/aurora/",
      "npm:/untheme",
    ]) {
      expect(bare(new URL(href)), href).toBe(true);
    }
  });

  it("is false for a file in a package, a scope alone, or another scheme", () => {
    for (const href of [
      "npm:/@untheme/aurora/src/resolver.json",
      "npm:/untheme/preset.json",
      "npm:/@untheme",
      "https://example.com/aurora",
      "file:///aurora",
    ]) {
      expect(bare(new URL(href)), href).toBe(false);
    }
  });
});

describe("designate", () => {
  it("reads the preset manifest of a bare package", () => {
    expect(designate(new URL("npm:/@untheme/aurora")).href).toBe(
      "npm:/@untheme/aurora/preset.json",
    );
    expect(designate(new URL("npm:/@untheme/aurora/")).href).toBe(
      "npm:/@untheme/aurora/preset.json",
    );
  });

  it("leaves any other URL as it is", () => {
    const url = new URL("npm:/@untheme/aurora/src/resolver.json");
    expect(designate(url)).toBe(url);
  });

  it("names a manifest by its file name", () => {
    expect(isPreset(new URL("npm:/@acme/tokens/preset.json"))).toBe(true);
    expect(isPreset(new URL("file:///app/.dist/preset.json"))).toBe(true);
    expect(isPreset(new URL("npm:/@acme/tokens/resolver.json"))).toBe(false);
  });
});

describe("readPreset", () => {
  it("reads the resolver and the layers, relative to the manifest", async () => {
    const { load } = loader(ROOT);
    const preset = await readPreset(
      new URL("npm:/@acme/tokens/preset.json"),
      load,
    );
    expect(preset.resolver.href).toBe("npm:/@acme/tokens/resolver.json");
    expect(preset.layers).toEqual([
      {
        entry: { id: "sky", name: "Sky", description: "A sky primary." },
        url: new URL("npm:/@acme/tokens/layers/sky.json"),
      },
    ]);
  });

  it("rejects a manifest without a resolver or a layer list", async () => {
    const load = async () => JSON.stringify({ layers: [] });
    await expect(
      readPreset(new URL("file:///x/preset.json"), load),
    ).rejects.toThrow(/is not a preset manifest/);
  });
});

describe("packageName", () => {
  it("reads the name of the package at the root", async () => {
    expect(await packageName(ROOT)).toBe("@acme/tokens");
  });

  it("is undefined without a package", async () => {
    expect(await packageName(fileURLToPath(FIXTURES))).toBeUndefined();
  });
});

describe("portable", () => {
  const source = new URL("src/resolver.json", PROJECT);

  it("rewrites a file of the project as an npm reference into the package", () => {
    const result = portable(
      {
        sets: { a: { sources: [{ $ref: "./tokens.json" }] } },
        resolutionOrder: [{ $ref: "#/sets/a" }],
      },
      source,
      PROJECT,
      "@acme/tokens",
    );
    expect(result).toEqual({
      sets: { a: { sources: [{ $ref: "npm:/@acme/tokens/src/tokens.json" }] } },
      resolutionOrder: [{ $ref: "#/sets/a" }],
    });
  });

  it("keeps a reference into another package or a remote document", () => {
    const refs = [
      "npm:/@untheme/aurora/src/tokens/space.json",
      "https://example.com/t.json#/dark",
    ];
    for (const $ref of refs) {
      expect(portable({ $ref }, source, PROJECT, "@acme/tokens")).toEqual({
        $ref,
      });
    }
  });

  it("keeps a pointer of a file reference", () => {
    expect(
      portable(
        { $ref: "../tokens.json#/primary" },
        source,
        PROJECT,
        "@acme/tokens",
      ),
    ).toEqual({ $ref: "npm:/@acme/tokens/tokens.json#/primary" });
  });

  it("rejects a file outside the project root", () => {
    expect(() =>
      portable({ $ref: "../../base.json" }, source, PROJECT, "@acme/tokens"),
    ).toThrow(/outside the project root/);
  });
});

describe("resolveKit with a preset source", () => {
  it("builds the resolver of the preset and inherits its layers", async () => {
    const kit = await resolveKit(
      { source: "npm:/@acme/tokens" },
      { cwd: ROOT },
    );
    expect(kit.theme.id).toBe("acme");
    expect(kit.theme.tokens.primary?.$value).toMatchObject({ hex: "#0080ff" });
    expect(kit.layers.map((built) => built.entry)).toEqual([
      { id: "acme", name: "Acme" },
      { id: "sky", name: "Sky", description: "A sky primary." },
    ]);
    expect(kit.layers[0]?.layer).toEqual({ id: "acme", name: "Acme" });
    expect(kit.layers[1]?.layer.tokens?.primary).toMatchObject({
      hex: "#80ccff",
    });
    expect(kit.documents).toContain(
      fileURLToPath(new URL("layers/sky.json", PROJECT)),
    );
  });

  it("lets a configured layer take the place of an inherited one", async () => {
    const kit = await resolveKit(
      { source: "npm:/@acme/tokens", layers: { sky: "./tokens.json" } },
      { cwd: ROOT },
    );
    expect(kit.layers.map((built) => built.entry.id)).toEqual(["acme", "sky"]);
    expect(kit.layers[1]?.layer.tokens?.primary).toMatchObject({
      hex: "#0080ff",
    });
  });

  it("rejects an inherited layer that violates the contract", async () => {
    const req = async (src: URL): Promise<string> => {
      if (src.pathname.endsWith("preset.json")) {
        return JSON.stringify({
          resolver: "./resolver.json",
          layers: [{ id: "bad", name: "Bad" }],
        });
      }
      if (src.pathname.endsWith("layers/bad.json")) {
        return JSON.stringify({ id: "bad", name: "Bad", tokens: { ghost: 1 } });
      }
      return readFile(src, "utf8");
    };
    await expect(
      resolveKit({ source: "./preset.json" }, { cwd: ROOT, req }),
    ).rejects.toThrow(/layers.bad: tokens.ghost/);
  });
});

describe("the layer of the base", () => {
  const ROOT = fileURLToPath(FIXTURES);

  it("has no tokens when the config leaves the base as the source has it", async () => {
    const kit = await resolveKit({ source: "./resolver.json" }, { cwd: ROOT });
    expect(kit.layers[0]?.layer).toEqual({ id: "fixture", name: "Fixture" });
  });

  it("holds what the config changed about the base", async () => {
    const kit = await resolveKit(
      {
        source: "./resolver.json",
        extend: {
          sets: {
            core: {
              sources: [
                {
                  size: {
                    $type: "dimension",
                    md: { $value: { value: 10, unit: "px" } },
                  },
                },
              ],
            },
          },
        },
      },
      { cwd: ROOT },
    );
    expect(kit.layers[0]?.layer).toEqual({
      id: "fixture",
      name: "Fixture",
      tokens: { "size.md": { value: 10, unit: "px" } },
    });
  });

  it("is replaced by a configured layer with its id", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", layers: { fixture: "./layer.json" } },
      { cwd: ROOT },
    );
    expect(kit.layers).toHaveLength(1);
    expect(kit.layers[0]?.entry.description).toBe(
      "A cooler primary over the fixture.",
    );
    expect(kit.layers[0]?.layer.tokens?.["size.md"]).toBe("{size.sm}");
  });
});

describe("the emitted preset", () => {
  it("writes the portable resolver and the manifest for a named package", async () => {
    const output = await generate(
      { source: "./resolver.json", name: "Mine" },
      { cwd: ROOT },
    );
    const paths = output.files.map((file) => file.path);
    expect(paths).toContain("resolver.json");
    expect(paths).toContain("preset.json");
    const resolver = JSON.parse(
      output.files.find((file) => file.path === "resolver.json")!.contents,
    );
    expect(resolver.name).toBe("Mine");
    expect(resolver.sets.base.sources).toEqual([
      { $ref: "npm:/@acme/tokens/tokens.json" },
    ]);
    const preset = JSON.parse(
      output.files.find((file) => file.path === "preset.json")!.contents,
    );
    expect(preset).toEqual({
      resolver: "./resolver.json",
      layers: [{ id: "mine", name: "Mine" }],
    });
  });

  it("writes nothing of the kind without a package", async () => {
    const output = await generate(
      { source: "./resolver.json" },
      { cwd: fileURLToPath(FIXTURES) },
    );
    const paths = output.files.map((file) => file.path);
    expect(paths).not.toContain("resolver.json");
    expect(paths).not.toContain("preset.json");
  });

  it("chains: a build on the emitted preset reads the same theme", async () => {
    const output = await generate(
      { source: "npm:/@acme/tokens" },
      { cwd: ROOT },
    );
    const files = new Map(
      output.files.map((file) => [file.path, file.contents]),
    );
    const req = async (src: URL): Promise<string> => {
      const at = src.pathname.split("/.dist/")[1];
      if (at !== undefined && files.has(at)) {
        return files.get(at)!;
      }
      return readFile(src, "utf8");
    };
    const first = await resolveKit(
      { source: "npm:/@acme/tokens" },
      { cwd: ROOT },
    );
    const second = await resolveKit(
      { source: "./.dist/preset.json" },
      { cwd: ROOT, req },
    );
    expect(second.theme).toEqual(first.theme);
    expect(second.layers).toEqual(first.layers);
  });
});
