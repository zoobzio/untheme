import type { Kit } from "@untheme/kit";
import type { Page } from "untheme/catalog";

import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { createApp, toWebHandler } from "h3";
import { beforeAll, describe, expect, it } from "vitest";

import { resolveKit } from "@untheme/kit";
import { defineSchema } from "untheme";

import {
  auroraThemes,
  createAuroraThemeHandler,
  loadAuroraTheme,
} from "../../src/aurora";
import { files } from "../../src/aurora/files";

const require = createRequire(import.meta.url);

/** Aurora's package root, as this package resolves it. */
const AURORA = dirname(require.resolve("@untheme/aurora/aurora.resolver.json"));

/** Every JSON file under a folder, as sorted posix paths relative to it. */
const list = async (folder: string): Promise<string[]> => {
  const entries = await readdir(folder, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => relative(folder, join(entry.parentPath, entry.name)))
    .map((path) => path.split(sep).join("/"))
    .sort();
};

const manifest: { id: string; name: string; description: string }[] =
  JSON.parse(await readFile(join(AURORA, "themes/index.json"), "utf8"));

let kit: Kit;
let ramps: Set<string>;

beforeAll(async () => {
  kit = await resolveKit(
    { source: "npm:/@untheme/aurora/aurora.resolver.json" },
    { cwd: fileURLToPath(new URL("../..", import.meta.url)) },
  );
  ramps = new Set();
  for (const path of await list(join(AURORA, "tokens/colors"))) {
    const document = JSON.parse(
      await readFile(join(AURORA, "tokens/colors", path), "utf8"),
    );
    for (const token of Object.keys(document)) {
      ramps.add(token);
    }
  }
});

describe("the aurora theme map", () => {
  it("covers every theme in aurora's manifest, in order", () => {
    expect(Object.keys(files)).toEqual(manifest.map((theme) => theme.id));
  });

  it("imports exactly the files of each theme's folder", async () => {
    for (const { id } of manifest) {
      expect(Object.keys(files[id] ?? {}).sort(), id).toEqual(
        await list(join(AURORA, "themes", id)),
      );
    }
  });

  it("lists aurora's manifest as the catalog entries", () => {
    expect(auroraThemes).toEqual(manifest);
  });
});

describe("loadAuroraTheme", () => {
  it("answers every theme as a valid layer of the aurora contract", async () => {
    const schema = defineSchema(kit.theme);
    expect(manifest).toHaveLength(31);
    for (const { id, name } of manifest) {
      const layer = await loadAuroraTheme(id);
      expect(layer?.id).toBe(id);
      expect(layer?.name).toBe(name);
      expect(() => schema.assert.layer(layer), id).not.toThrow();
    }
  });

  it("rebinds every ramp token and nothing else", async () => {
    expect(ramps.size).toBe(220);
    for (const { id } of manifest) {
      const layer = await loadAuroraTheme(id);
      expect(new Set(Object.keys(layer?.tokens ?? {})), id).toEqual(ramps);
    }
  });

  it("misses an id aurora does not ship", async () => {
    await expect(loadAuroraTheme("ghost")).resolves.toBeUndefined();
    await expect(loadAuroraTheme("toString")).resolves.toBeUndefined();
  });
});

describe("createAuroraThemeHandler", () => {
  const request = (path: string) =>
    toWebHandler(createApp().use("/api/untheme", createAuroraThemeHandler()))(
      new Request(`http://app.test/api/untheme${path}`),
    );

  it("lists every aurora theme across pages", async () => {
    const q = encodeURIComponent(JSON.stringify({ limit: 50 }));
    const page = (await (await request(`/themes?q=${q}`)).json()) as Page;
    expect(page.total).toBe(31);
    expect(page.entries.map((entry) => entry.id).sort()).toEqual(
      manifest.map((theme) => theme.id).sort(),
    );
  });

  it("answers one theme by id, and 404 for a miss", async () => {
    const nord = await request("/themes/nord");
    expect(nord.status).toBe(200);
    expect(await nord.json()).toEqual(await loadAuroraTheme("nord"));
    expect((await request("/themes/ghost")).status).toBe(404);
  });
});
