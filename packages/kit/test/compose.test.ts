import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { compose } from "../src/compose";
import { resolveKit } from "../src/resolve";
import { FIXTURES } from "./helpers";

const ROOT = fileURLToPath(new URL("compose/", FIXTURES));
const PROJECT = fileURLToPath(new URL("project/", FIXTURES));

/** Serves in-memory documents under virtual names beside the compose fixtures. */
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

const UPSTREAM = "./upstream.resolver.json";

describe("compose", () => {
  it("builds the same contract as the document it references, with the override", async () => {
    const upstream = await resolveKit({ source: UPSTREAM }, { cwd: ROOT });
    const extended = await resolveKit(
      { source: "./extends.resolver.json" },
      { cwd: ROOT },
    );
    expect(extended.theme.name).toBe("Extended");
    expect(Object.keys(extended.theme.tokens).sort()).toEqual(
      Object.keys(upstream.theme.tokens).sort(),
    );
    expect(extended.theme.modifiers).toEqual(upstream.theme.modifiers);
    expect(extended.theme.order).toEqual(["color", "density"]);
    expect(extended.input).toEqual({ color: "light", density: "default" });
    // The overriding sources replace the referenced ones.
    expect(upstream.theme.tokens["color.primary.600"]?.$value).toMatchObject({
      hex: "#1d4ed8",
    });
    expect(extended.theme.tokens["color.primary.600"]?.$value).toMatchObject({
      hex: "#1a66e6",
    });
  });

  it("resolves the references inside a referenced modifier against its own document", async () => {
    const kit = await resolveKit(
      { source: "./extends.resolver.json" },
      { cwd: ROOT },
    );
    // `../dim.json` of the upstream dark context, read from beside upstream.
    expect(kit.theme.modifiers.color?.dark?.["color.primary.default"]).toBe(
      "{color.primary.50}",
    );
    expect(kit.documents).toContain(
      fileURLToPath(new URL("dim.json", FIXTURES)),
    );
    expect(kit.documents).toContain(
      fileURLToPath(new URL("compose/upstream.resolver.json", FIXTURES)),
    );
  });

  it("carries the names and descriptions of the referenced declarations", async () => {
    const kit = await resolveKit(
      { source: "./extends.resolver.json" },
      { cwd: ROOT },
    );
    expect(kit.manifest.map((entry) => entry.name)).toEqual([
      "Color scheme",
      "Density",
    ]);
    expect(kit.manifest[0]?.description).toBe("The scheme.");
  });

  it("expands a reference in the root sets and modifiers maps, with overrides", async () => {
    const kit = await resolveKit(
      { source: "./declares.resolver.json" },
      { cwd: ROOT },
    );
    const upstream = await resolveKit({ source: UPSTREAM }, { cwd: ROOT });
    expect(Object.keys(kit.theme.tokens).sort()).toEqual(
      Object.keys(upstream.theme.tokens).sort(),
    );
    expect(kit.theme.modifiers.color).toEqual(upstream.theme.modifiers.color);
    // The `default` beside the reference overrides the referenced default, so
    // the base boots at the compact density, and the default context rebinds.
    expect(kit.input).toEqual({ color: "light", density: "compact" });
    expect(kit.theme.tokens["size.md"]?.$value).toEqual({
      value: 6,
      unit: "px",
    });
    expect(kit.theme.modifiers.density).toEqual({
      compact: {},
      default: { "size.md": { value: 8, unit: "px" } },
    });
  });

  it("follows a chain of references and applies each override in turn", async () => {
    const kit = await resolveKit(
      { source: "./chain.resolver.json" },
      { cwd: ROOT },
    );
    expect(Object.keys(kit.theme.tokens)).toContain("color.primary.600");
    expect(kit.theme.order).toEqual(["density"]);
    // The override of the middle document still applies.
    expect(kit.input).toEqual({ density: "compact" });
    const src = await readFile(
      new URL("compose/chain.resolver.json", FIXTURES),
      "utf8",
    );
    const composed = JSON.parse(
      await compose(
        src,
        new URL("compose/chain.resolver.json", FIXTURES),
        (url) => readFile(url, "utf8"),
      ),
    ) as { resolutionOrder: Record<string, unknown>[] };
    expect(composed.resolutionOrder[0]).toMatchObject({
      type: "set",
      name: "core",
      description: "Chained.",
      sources: [{ $ref: new URL("base.json", FIXTURES).href }],
    });
    expect(composed.resolutionOrder[1]).toMatchObject({
      type: "modifier",
      name: "density",
      default: "compact",
    });
  });

  it("works with the modifiers of the config", async () => {
    const kit = await resolveKit(
      {
        source: "./extends.resolver.json",
        modifiers: { density: false, color: { default: "dark" } },
      },
      { cwd: ROOT },
    );
    expect(kit.theme.order).toEqual(["color"]);
    expect(kit.input).toEqual({ color: "dark" });
  });

  it("resolves a reference into an installed package", async () => {
    const kit = await resolveKit(
      { source: "./extends.resolver.json", name: "Acme Extended" },
      { cwd: PROJECT },
    );
    expect(kit.theme.tokens.primary?.$value).toMatchObject({ hex: "#0080ff" });
    const src = await readFile(
      new URL("project/extends.resolver.json", FIXTURES),
      "utf8",
    );
    const composed = JSON.parse(
      await compose(
        src,
        new URL("project/extends.resolver.json", FIXTURES),
        async (url) => {
          expect(url.href).toBe("npm:/@acme/tokens/resolver.json");
          return readFile(new URL("project/resolver.json", FIXTURES), "utf8");
        },
      ),
    ) as { resolutionOrder: Record<string, unknown>[] };
    expect(composed.resolutionOrder[0]).toEqual({
      type: "set",
      name: "base",
      description: "From the package.",
      sources: [{ $ref: "npm:/@acme/tokens/tokens.json" }],
    });
  });

  it("returns the text as it is when the document references nothing external", async () => {
    const url = new URL("compose/upstream.resolver.json", FIXTURES);
    const src = await readFile(url, "utf8");
    const reads: string[] = [];
    const out = await compose(src, url, async (at) => {
      reads.push(at.href);
      return readFile(at, "utf8");
    });
    expect(out).toBe(src);
    expect(reads).toEqual([]);
    expect(await compose("not json", url, async () => "")).toBe("not json");
  });

  it("rejects a reference to a set or a modifier the document lacks", async () => {
    const failure = resolveKit(
      { source: "./missing.resolver.json" },
      {
        cwd: ROOT,
        req: serve({
          "missing.resolver.json": {
            version: "2025.10",
            resolutionOrder: [{ $ref: `${UPSTREAM}#/sets/ghost` }],
          },
        }),
      },
    );
    await expect(failure).rejects.toThrow(/declares no set "ghost"/);
  });

  it("rejects a set that references a modifier, and the reverse", async () => {
    const mixed = resolveKit(
      { source: "./mixed.resolver.json" },
      {
        cwd: ROOT,
        req: serve({
          "mixed.resolver.json": {
            version: "2025.10",
            sets: { core: { $ref: `${UPSTREAM}#/modifiers/color` } },
            resolutionOrder: [{ $ref: "#/sets/core" }],
          },
        }),
      },
    );
    await expect(mixed.catch((error: Error) => error.message)).resolves.toMatch(
      /sets\.core references .* which is not a set/,
    );
    const chained = resolveKit(
      { source: "./chained.resolver.json" },
      {
        cwd: ROOT,
        req: serve({
          "chained.resolver.json": {
            version: "2025.10",
            resolutionOrder: [
              { $ref: "./middle.resolver.json#/modifiers/color" },
            ],
          },
          "middle.resolver.json": {
            version: "2025.10",
            modifiers: { color: { $ref: `${UPSTREAM}#/sets/core` } },
            resolutionOrder: [{ $ref: "#/modifiers/color" }],
          },
        }),
      },
    );
    await expect(chained).rejects.toThrow(/which is not a modifier/);
  });

  it("rejects a loop of references", async () => {
    const failure = resolveKit(
      { source: "./a.resolver.json" },
      {
        cwd: ROOT,
        req: serve({
          "a.resolver.json": {
            version: "2025.10",
            sets: { core: { $ref: "./b.resolver.json#/sets/core" } },
            resolutionOrder: [{ $ref: "#/sets/core" }],
          },
          "b.resolver.json": {
            version: "2025.10",
            sets: { core: { $ref: "./a.resolver.json#/sets/core" } },
            resolutionOrder: [{ $ref: "#/sets/core" }],
          },
        }),
      },
    );
    await expect(failure).rejects.toThrow(/the references loop/);
  });
});
