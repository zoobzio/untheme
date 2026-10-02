import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import type { Schema, Template } from "@untheme/schema";

import { defineSchema } from "@untheme/schema";

import { InvalidConfigError } from "../src/error";
import { resolveKit } from "../src/resolve";
import { FIXTURES } from "./helpers";

/** The fixtures directory as a path — the project root the tests build in. */
const ROOT = fileURLToPath(FIXTURES);

describe("resolveKit", () => {
  it("resolves a theme and selection the untheme schema accepts", async () => {
    const kit = await resolveKit({ source: "./resolver.json" }, { cwd: ROOT });
    expect(kit.theme.id).toBe("fixture");
    expect(kit.theme.name).toBe("Fixture");
    expect(kit.theme.tokens["color.primary.default"]?.$value).toBe(
      "{color.primary.600}",
    );
    expect(kit.theme.order).toEqual(["color", "density"]);
    expect(kit.input).toEqual({ color: "light", density: "default" });

    const schema: Schema<Template> = defineSchema(kit.theme);
    schema.assert.theme(kit.theme);
    schema.assert.input(kit.input);
  });

  it("lets the config replace the resolver's identity", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", id: "app", name: "App" },
      { cwd: ROOT },
    );
    expect(kit.theme.id).toBe("app");
    expect(kit.theme.name).toBe("App");
  });

  it("slugs a configured name into the id", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", name: "My App" },
      { cwd: ROOT },
    );
    expect(kit.theme.id).toBe("my-app");
  });

  it("defaults the output directory and normalizes a configured one", async () => {
    const kit = await resolveKit({ source: "./resolver.json" }, { cwd: ROOT });
    expect(kit.outDir).toBe("untheme");
    const nested = await resolveKit(
      { source: "./resolver.json", outDir: "./src/theme/" },
      { cwd: ROOT },
    );
    expect(nested.outDir).toBe("src/theme");
  });

  it("records every local document it read, the resolver first", async () => {
    const kit = await resolveKit({ source: "./resolver.json" }, { cwd: ROOT });
    expect(kit.documents).toEqual([
      fileURLToPath(new URL("resolver.json", FIXTURES)),
      fileURLToPath(new URL("base.json", FIXTURES)),
    ]);
  });

  it("accepts a URL source", async () => {
    const kit = await resolveKit({
      source: new URL("resolver.json", FIXTURES),
    });
    expect(kit.theme.id).toBe("fixture");
  });

  it("loads every document through a caller-supplied req", async () => {
    const requested: string[] = [];
    const req = async (src: URL): Promise<string> => {
      requested.push(src.href);
      const name = src.pathname.split("/").pop() ?? "";
      return readFile(new URL(name, FIXTURES), "utf8");
    };
    const kit = await resolveKit(
      { source: "https://api.example.test/resolver.json" },
      { req },
    );
    expect(kit.theme.id).toBe("fixture");
    expect(requested).toContain("https://api.example.test/resolver.json");
    expect(requested).toContain("https://api.example.test/base.json");
    expect(kit.documents).toEqual([]);
  });

  it("builds a resolver whose modifiers are declared inline", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json" },
      {
        req: async (src) => {
          if (src.pathname.endsWith("/resolver.json")) {
            const resolver = JSON.parse(
              await readFile(new URL("resolver.json", FIXTURES), "utf8"),
            );
            resolver.resolutionOrder[2] = {
              type: "modifier",
              name: "density",
              ...resolver.modifiers.density,
            };
            delete resolver.modifiers.density;
            return JSON.stringify(resolver);
          }
          return readFile(src, "utf8");
        },
        cwd: ROOT,
      },
    );
    expect(kit.theme.order).toEqual(["color", "density"]);
    expect(kit.theme.modifiers.density?.compact).toEqual({
      "size.md": { value: 6, unit: "px" },
    });
  });

  it("rejects off-spec token types by name", async () => {
    await expect(
      resolveKit(
        { source: "./boolean.json", id: "flags", name: "Flags" },
        { cwd: ROOT },
      ),
    ).rejects.toThrow(/"boolean".*feature\.enabled/);
  });

  it("cites the source document when the schema rejects a value", async () => {
    await expect(
      resolveKit(
        { source: "./em.json", id: "spacing", name: "Spacing" },
        { cwd: ROOT },
      ),
    ).rejects.toThrow(/em\.json/);
  });

  it("requires an identity when the document carries none", async () => {
    await expect(
      resolveKit({ source: "./base.json" }, { cwd: ROOT }),
    ).rejects.toThrow(/no theme identity/);
  });

  it("rejects an invalid config before reading anything", async () => {
    const req = async (): Promise<string> => {
      throw new Error("read");
    };
    const failure = resolveKit(
      { source: "", name: "", outDir: "../outside" },
      { req },
    );
    await expect(failure).rejects.toBeInstanceOf(InvalidConfigError);
    await expect(failure).rejects.toMatchObject({
      issues: [
        "source must be a path, a URL, or an npm:/ reference",
        "name must be a non-empty string when set",
        'outDir "../outside" must be a subdirectory of the project root',
      ],
    });
  });
});
