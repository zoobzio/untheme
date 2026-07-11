import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import type { Schema, Template } from "untheme";

import { defineSchema, guard } from "untheme";

import { generate } from "../src/generate";
import { FIXTURES } from "./helpers";

describe("generate", () => {
  it("emits a config the untheme schema accepts end to end", async () => {
    const result = await generate({
      source: "./resolver.json",
      cwd: FIXTURES,
      themes: [{ source: "./dark-ocean.json", name: "Dark Ocean" }],
    });
    expect(result.filename).toBe("untheme.config.ts");
    expect(result.contents).toContain(
      `import { defineUnthemeConfig } from "untheme/config";`,
    );
    expect(result.contents).toContain(`"{color.primary.600}"`);
    expect(result.contents).toContain(`id: "fixture"`);
    expect(result.contents).toContain(`"dark-ocean"`);

    /*
     * The generated module must be importable and must satisfy untheme's own
     * validation from the consumer's side — the same checks the nuxt module
     * runs against a hand-authored config.
     */
    const out = new URL("./.generated/", import.meta.url);
    await mkdir(out, { recursive: true });
    await writeFile(new URL("./.gitignore", out), "*\n");
    const file = new URL("./untheme.config.mjs", out);
    await writeFile(file, result.contents);
    const imported = await import(pathToFileURL(file.pathname).href);
    const config = imported.default;
    if (!guard(config.base)) {
      throw new Error("generated base is not structurally a theme");
    }
    const schema: Schema<Template> = defineSchema(config.base);
    schema.assert.input(config.input);
    for (const layer of Object.values(config.themes)) {
      schema.assert.layer(layer);
    }
  });

  it("loads every document through a caller-supplied req", async () => {
    const requested: string[] = [];
    const req = async (src: URL): Promise<string> => {
      requested.push(src.href);
      const name = src.pathname.split("/").pop() ?? "";
      return readFile(new URL(name, FIXTURES), "utf8");
    };
    const result = await generate({
      source: "https://api.example.test/resolver.json",
      req,
      themes: [{ source: "https://api.example.test/dark-ocean.json" }],
    });
    expect(result.contents).toContain(`"dark-ocean"`);
    expect(requested).toContain("https://api.example.test/resolver.json");
    expect(requested).toContain("https://api.example.test/base.json");
    expect(requested).toContain("https://api.example.test/dark-ocean.json");
  });

  it("rejects off-spec token types by name", async () => {
    await expect(
      generate({
        source: "./boolean.json",
        cwd: FIXTURES,
        id: "flags",
        name: "Flags",
      }),
    ).rejects.toThrow(/"boolean".*feature\.enabled/);
  });

  it("cites the source document when the schema rejects a value", async () => {
    await expect(
      generate({
        source: "./em.json",
        cwd: FIXTURES,
        id: "spacing",
        name: "Spacing",
      }),
    ).rejects.toThrow(/em\.json/);
  });

  it("requires an identity when the document carries none", async () => {
    await expect(
      generate({
        source: "./base.json",
        cwd: FIXTURES,
      }),
    ).rejects.toThrow(/no theme identity/);
  });
});
