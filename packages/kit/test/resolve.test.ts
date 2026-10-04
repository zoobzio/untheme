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

  it("keeps only the contexts the config lists, in its order", async () => {
    const kit = await resolveKit(
      {
        source: "./resolver.json",
        modifiers: { density: { contexts: ["compact", "default"] } },
      },
      { cwd: ROOT },
    );
    expect(Object.keys(kit.theme.modifiers.density ?? {})).toEqual([
      "compact",
      "default",
    ]);
    expect(kit.theme.modifiers.color).toEqual(
      (await resolveKit({ source: "./resolver.json" }, { cwd: ROOT })).theme
        .modifiers.color,
    );
    expect(kit.input).toEqual({ color: "light", density: "default" });
  });

  it("boots the first kept context when the document's default is left out", async () => {
    const kit = await resolveKit(
      {
        source: "./resolver.json",
        modifiers: { color: { contexts: ["dark"] } },
      },
      { cwd: ROOT },
    );
    expect(kit.input).toEqual({ color: "dark", density: "default" });
    expect(kit.theme.modifiers.color).toEqual({ dark: {} });
    expect(kit.theme.tokens["color.primary.default"]?.$value).toBe(
      "{color.primary.50}",
    );
    const schema: Schema<Template> = defineSchema(kit.theme);
    schema.assert.input(kit.input);
  });

  it("boots the default the config names, and rebinds the rest against it", async () => {
    const kit = await resolveKit(
      { source: "./resolver.json", modifiers: { color: { default: "dark" } } },
      { cwd: ROOT },
    );
    expect(kit.input.color).toBe("dark");
    expect(Object.keys(kit.theme.modifiers.color ?? {})).toEqual([
      "light",
      "dark",
    ]);
    expect(kit.theme.modifiers.color?.dark).toEqual({});
    expect(kit.theme.modifiers.color?.light).toHaveProperty(
      ["color.primary.default"],
      "{color.primary.600}",
    );
  });

  it("never reads the files of a context the config leaves out", async () => {
    const full = await resolveKit(
      {
        source: "./resolver.json",
        modifiers: { color: { add: { dim: "./dim.json" } } },
      },
      { cwd: ROOT },
    );
    expect(full.documents.some((path) => path.endsWith("dim.json"))).toBe(true);
    const narrowed = await resolveKit(
      {
        source: "./resolver.json",
        modifiers: {
          color: { add: { dim: "./dim.json" }, contexts: ["light", "dark"] },
        },
      },
      { cwd: ROOT },
    );
    expect(narrowed.documents.some((path) => path.endsWith("dim.json"))).toBe(
      false,
    );
  });

  it("adds a context from a token file the config points at", async () => {
    const kit = await resolveKit(
      {
        source: "./resolver.json",
        modifiers: { color: { add: { dim: "./dim.json" }, default: "dim" } },
      },
      { cwd: ROOT },
    );
    expect(Object.keys(kit.theme.modifiers.color ?? {})).toEqual([
      "light",
      "dark",
      "dim",
    ]);
    expect(kit.input.color).toBe("dim");
    expect(kit.theme.modifiers.color?.dim).toEqual({});
    expect(kit.theme.tokens["color.primary.default"]?.$value).toBe(
      "{color.primary.50}",
    );
    expect(kit.theme.modifiers.color?.light).toEqual({
      "color.primary.default": "{color.primary.600}",
    });
  });

  it("rejects an added context that binds a token the base lacks", async () => {
    await expect(
      resolveKit(
        {
          source: "./resolver.json",
          modifiers: { color: { add: { odd: "./extra.json" } } },
        },
        { cwd: ROOT },
      ),
    ).rejects.toThrow(
      /context "odd" of modifier "color" introduces tokens missing from the base contract: extra/,
    );
  });

  it("turns a modifier off, leaving its default context in the base", async () => {
    const whole = await resolveKit(
      { source: "./resolver.json" },
      { cwd: ROOT },
    );
    const kit = await resolveKit(
      { source: "./resolver.json", modifiers: { density: false } },
      { cwd: ROOT },
    );
    expect(kit.theme.order).toEqual(["color"]);
    expect(kit.theme.modifiers).toEqual({ color: whole.theme.modifiers.color });
    expect(kit.input).toEqual({ color: "light" });
    expect(kit.theme.tokens).toEqual(whole.theme.tokens);
  });

  it("turns off a modifier declared inline in the resolution order", async () => {
    const document = JSON.parse(
      await readFile(new URL("resolver.json", FIXTURES), "utf8"),
    );
    const { color, density } = document.modifiers;
    document.modifiers = {};
    document.resolutionOrder = [
      { $ref: "#/sets/core" },
      { type: "modifier", name: "color", ...color },
      { type: "modifier", name: "density", ...density },
    ];
    const req = async (src: URL): Promise<string> => {
      if (src.pathname.endsWith("inline.json")) {
        return JSON.stringify(document);
      }
      return readFile(src, "utf8");
    };
    const kit = await resolveKit(
      {
        source: "./inline.json",
        modifiers: { color: false, density: { contexts: ["compact"] } },
      },
      { cwd: ROOT, req },
    );
    expect(kit.theme.order).toEqual(["density"]);
    expect(kit.input).toEqual({ density: "compact" });
  });

  it("rejects modifiers and contexts the source does not declare", async () => {
    const failure = resolveKit(
      {
        source: "./resolver.json",
        modifiers: {
          color: { contexts: ["dark", "dim"], add: { light: "./dim.json" } },
          density: { default: "roomy" },
          theme: { contexts: ["nord"] },
        },
      },
      { cwd: ROOT },
    );
    await expect(failure).rejects.toBeInstanceOf(InvalidConfigError);
    await expect(failure).rejects.toMatchObject({
      issues: [
        'modifiers.color.add: "light" is already a context of "color"',
        'modifiers.color.contexts: "dim" is not a context of "color" (light, dark)',
        'modifiers.density.default: "roomy" is not one of the kept contexts (default, compact)',
        'modifiers.theme: the source declares no modifier "theme" (color, density)',
      ],
    });
  });

  it("rejects modifiers on a plain token document", async () => {
    await expect(
      resolveKit(
        {
          source: "./base.json",
          name: "Base",
          modifiers: { color: { default: "dark" } },
        },
        { cwd: ROOT },
      ),
    ).rejects.toThrow(/the source declares no modifier "color" \(none\)/);
  });

  it("rejects a malformed modifiers member before reading anything", async () => {
    const req = async (): Promise<string> => {
      throw new Error("read");
    };
    const failure = resolveKit(
      {
        source: "./resolver.json",
        modifiers: {
          color: { contexts: [] },
          density: { contexts: ["compact"], default: "default" },
          // @ts-expect-error — a bare list is not a modifier entry.
          text: ["sm"],
          motion: { contexts: ["a", "a"], default: "" },
          radius: { add: { soft: "", hard: [] } },
        },
      },
      { req },
    );
    await expect(failure).rejects.toMatchObject({
      issues: [
        "modifiers.color.contexts must list at least one context name, each once",
        'modifiers.density.default "default" is not one of its contexts (compact)',
        "modifiers.text must be false, or an object with add, contexts, or default",
        "modifiers.motion.contexts must list at least one context name, each once",
        "modifiers.motion.default must be a non-empty string when set",
        "modifiers.radius.add.soft must be a path, a URL, or an npm:/ reference, or a list of them",
        "modifiers.radius.add.hard must be a path, a URL, or an npm:/ reference, or a list of them",
      ],
    });
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
