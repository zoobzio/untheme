import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import type { Schema, Template } from "@untheme/schema";

import { defineSchema } from "@untheme/schema";
import { makeUntheme } from "@untheme/core";

import type { KitConfig } from "../src/types";

import { build } from "../src/build";
import { InvalidConfigError, InvalidLayerError } from "../src/error";
import { generate } from "../src/generate";
import { resolveKit } from "../src/resolve";
import { FIXTURES } from "./helpers";

const ROOT = fileURLToPath(FIXTURES);

/** Serves in-memory layer documents under virtual names beside the fixtures. */
const serve = (documents: Record<string, object>) => {
  return async (src: URL): Promise<string> => {
    const name = src.pathname.split("/").pop() ?? "";
    const document = documents[name];
    if (document !== undefined) {
      return JSON.stringify(document);
    }
    return readFile(src, "utf8");
  };
};

describe("layers", () => {
  it("builds a layer from a token document, flattened and checked", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", layers: { cool: "./layer.json" } },
      { cwd: ROOT },
    );
    expect(kit.layers).toHaveLength(2);
    const [, built] = kit.layers;
    expect(built?.entry).toEqual({
      id: "cool",
      name: "Cool",
      description: "A cooler primary over the fixture.",
    });
    expect(built?.layer).toEqual({
      id: "cool",
      name: "Cool",
      tokens: {
        "color.primary.600": {
          colorSpace: "srgb",
          components: [0.1, 0.4, 0.9],
          hex: "#1a66e6",
          alpha: 1,
        },
        "color.primary.default": "{color.primary.50}",
        "size.md": "{size.sm}",
      },
    });
    const schema: Schema<Template> = defineSchema(kit.theme);
    expect(schema.check.layer(built?.layer)).toBe(true);
  });

  it("applies to a service over the base theme as it is", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", layers: { cool: "./layer.json" } },
      { cwd: ROOT },
    );
    const ut = makeUntheme(kit.theme, { patch: {}, input: kit.input });
    expect(ut.resolve("color.primary.default")).toMatchObject({
      hex: "#1d4ed8",
    });
    ut.apply(kit.layers[1]!.layer);
    expect(ut.theme().id).toBe("cool");
    expect(ut.resolve("color.primary.default")).toMatchObject({
      hex: "#e5f2ff",
    });
    expect(ut.resolve("size.md")).toEqual({ value: 4, unit: "px" });
    // The selected context wins over the layer.
    ut.swap("density", "compact");
    expect(ut.resolve("size.md")).toEqual({ value: 6, unit: "px" });
  });

  it("records the documents of each layer for the watch list", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", layers: { cool: "./layer.json" } },
      { cwd: ROOT },
    );
    expect(kit.documents).toContain(
      fileURLToPath(new URL("layer.json", FIXTURES)),
    );
  });

  it("names a layer by its titled id when the document has no name", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", layers: { dim_one: "./dim.json" } },
      { cwd: ROOT },
    );
    expect(kit.layers[1]?.entry).toEqual({ id: "dim_one", name: "Dim One" });
    expect(kit.layers[1]?.layer.name).toBe("Dim One");
  });

  it("merges a list of documents, and the last one wins", async () => {
    const kit = await resolveKit(
      {
        source: "./resolver.json",
        layers: { both: ["./layer.json", "./dim.json"] },
      },
      {
        cwd: ROOT,
        req: serve({
          "dim.json": {
            $description: "The last description wins.",
            color: {
              $type: "color",
              primary: { default: { $value: "{color.primary.600}" } },
            },
          },
        }),
      },
    );
    const [, built] = kit.layers;
    expect(built?.entry).toEqual({
      id: "both",
      name: "Cool",
      description: "The last description wins.",
    });
    expect(built?.layer.tokens?.["color.primary.default"]).toBe(
      "{color.primary.600}",
    );
    expect(built?.layer.tokens?.["size.md"]).toBe("{size.sm}");
  });

  it("keeps the order of the config", async () => {
    const kit = await resolveKit(
      {
        source: "./resolver.json",
        layers: { second: "./dim.json", first: "./layer.json" },
      },
      { cwd: ROOT },
    );
    expect(kit.layers.map((built) => built.entry.id)).toEqual([
      "fixture",
      "second",
      "first",
    ]);
  });

  it("reports every violation of every layer together", async () => {
    const failure = resolveKit(
      {
        source: "./resolver.json",
        layers: {
          alien: "./alien.json",
          typed: "./typed.json",
          dangling: "./dangling.json",
          shaped: "./shaped.json",
          fine: "./layer.json",
        },
      },
      {
        cwd: ROOT,
        req: serve({
          "alien.json": { ghost: { $type: "number", $value: 1 } },
          "typed.json": {
            size: { $type: "number", md: { $value: 4 } },
          },
          "dangling.json": {
            color: {
              $type: "color",
              surface: { $value: "{color.primary.900}" },
            },
          },
          "shaped.json": {
            size: {
              $type: "dimension",
              md: { $value: { value: 1, unit: "em" } },
            },
          },
        }),
      },
    );
    await expect(failure).rejects.toBeInstanceOf(InvalidLayerError);
    await expect(failure).rejects.toMatchObject({
      issues: [
        expect.stringMatching(/^layers\.alien: tokens\.ghost: /),
        'layers.typed: tokens.size.md declares type "number", the contract has "dimension"',
        expect.stringMatching(/^layers\.typed: tokens\.size\.md: /),
        expect.stringMatching(
          /^layers\.dangling: tokens\.color\.surface: .*known token/,
        ),
        expect.stringMatching(/^layers\.shaped: tokens\.size\.md\.unit: /),
      ],
    });
  });

  it("rejects a malformed layers member before reading anything", async () => {
    const req = async (): Promise<string> => {
      throw new Error("read");
    };
    const failure = resolveKit(
      {
        source: "./resolver.json",
        layers: { nord: "", "": "./layer.json", list: [] },
      },
      { req },
    );
    await expect(failure).rejects.toBeInstanceOf(InvalidConfigError);
    await expect(failure).rejects.toMatchObject({
      issues: [
        "layers.nord must be a path, a URL, or an npm:/ reference, or a list of them",
        "layers has an empty id",
        "layers.list must be a path, a URL, or an npm:/ reference, or a list of them",
      ],
    });
  });

  it("builds every JSON file of a directory as a layer, in name order", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", layers: "./themes" },
      { cwd: ROOT },
    );
    expect(kit.layers.map((built) => built.entry)).toEqual([
      { id: "fixture", name: "Fixture" },
      {
        id: "cool",
        name: "Cool",
        description: "A cooler primary over the fixture.",
      },
      { id: "dim", name: "Dim" },
    ]);
    expect(kit.layers[1]?.layer.tokens?.["size.md"]).toBe("{size.sm}");
  });

  it("takes the directory as a file URL, with or without a trailing slash", async () => {
    for (const layers of [
      new URL("themes", FIXTURES),
      new URL("themes/", FIXTURES),
      "./themes/",
    ]) {
      const kit = await resolveKit(
        { source: "./resolver.json", layers },
        { cwd: ROOT },
      );
      expect(kit.layers.map((built) => built.entry.id)).toEqual([
        "fixture",
        "cool",
        "dim",
      ]);
    }
  });

  it("records the directory and its documents for the watch list", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", layers: "./themes" },
      { cwd: ROOT },
    );
    expect(kit.documents).toContain(fileURLToPath(new URL("themes", FIXTURES)));
    expect(kit.documents).toContain(
      fileURLToPath(new URL("themes/cool.json", FIXTURES)),
    );
    expect(kit.documents).toContain(
      fileURLToPath(new URL("themes/dim.json", FIXTURES)),
    );
  });

  it("rejects a remote or empty layers directory before reading anything", async () => {
    const req = async (): Promise<string> => {
      throw new Error("read");
    };
    for (const layers of [
      "",
      "https://example.com/themes",
      "npm:/@untheme/aurora/src/themes",
      new URL("npm:/@untheme/aurora/src/themes"),
    ]) {
      const failure = resolveKit(
        { source: "./resolver.json", layers },
        { req },
      );
      await expect(failure).rejects.toBeInstanceOf(InvalidConfigError);
      await expect(failure).rejects.toMatchObject({
        issues: [
          "layers must be a path to a local directory when it is not an object of layer ids",
        ],
      });
    }
  });

  it("rejects a layers member that is neither a directory nor an object", async () => {
    const config: KitConfig = JSON.parse(
      '{ "source": "./resolver.json", "layers": 7 }',
    );
    const failure = resolveKit(config, { cwd: ROOT });
    await expect(failure).rejects.toMatchObject({
      issues: [
        "layers must be a path to a local directory, or an object of layer ids",
      ],
    });
  });

  it("fails with the path when the layers directory cannot be listed", async () => {
    await expect(
      resolveKit(
        { source: "./resolver.json", layers: "./missing" },
        { cwd: ROOT },
      ),
    ).rejects.toThrow(
      `@untheme/kit: cannot list the layers in ${fileURLToPath(new URL("missing", FIXTURES))}`,
    );
    await expect(
      resolveKit(
        { source: "./resolver.json", layers: "./layer.json" },
        { cwd: ROOT },
      ),
    ).rejects.toThrow("@untheme/kit: cannot list the layers in ");
  });

  it("emits one JSON file for each layer and a typed list of the layers", async () => {
    const output = await generate(
      {
        source: "./resolver.json",
        layers: { cool: "./layer.json", dim: "./dim.json" },
      },
      { cwd: ROOT },
    );
    const paths = output.files.map((file) => file.path);
    expect(paths).toContain("layers/cool.json");
    expect(paths).toContain("layers/dim.json");
    const cool = output.files.find((file) => file.path === "layers/cool.json")!;
    expect(cool.contents.endsWith("\n")).toBe(true);
    expect(JSON.parse(cool.contents)).toMatchObject({
      id: "cool",
      name: "Cool",
    });

    const module = output.files.find((file) => file.path === "layers.mjs")!;
    const literal = module.contents
      .split("export const layers = ")[1]!
      .split(";\nexport default")[0]!;
    expect(JSON.parse(literal)).toEqual([
      { id: "fixture", name: "Fixture" },
      {
        id: "cool",
        name: "Cool",
        description: "A cooler primary over the fixture.",
      },
      { id: "dim", name: "Dim" },
    ]);
    const declarations = output.files.find(
      (file) => file.path === "layers.d.mts",
    )!.contents;
    expect(declarations).toContain(
      'export type LayerId =\n  | "fixture"\n  | "cool"\n  | "dim";',
    );
  });

  it("writes the layer files and removes a layer that left the config", async () => {
    const root = await mkdtemp(join(tmpdir(), "untheme-kit-layers-"));
    try {
      const resolver = fileURLToPath(new URL("resolver.json", FIXTURES));
      const layer = fileURLToPath(new URL("layer.json", FIXTURES));
      const dim = fileURLToPath(new URL("dim.json", FIXTURES));
      const config = (layers: string) =>
        writeFile(
          join(root, "untheme.config.ts"),
          `export default { source: ${JSON.stringify(resolver)}, layers: ${layers} };\n`,
        );
      await config(
        `{ cool: ${JSON.stringify(layer)}, dim: ${JSON.stringify(dim)} }`,
      );
      await build({ root });
      expect((await readdir(join(root, "untheme", "layers"))).sort()).toEqual([
        "cool.json",
        "dim.json",
        "fixture.json",
      ]);
      await config(`{ cool: ${JSON.stringify(layer)} }`);
      await build({ root });
      expect((await readdir(join(root, "untheme", "layers"))).sort()).toEqual([
        "cool.json",
        "fixture.json",
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
