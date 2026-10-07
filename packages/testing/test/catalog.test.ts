import type { Layer } from "untheme";

import { describe, expect, it } from "vitest";

import { MalformedLayerError } from "untheme/catalog";

import { bootUntheme } from "../src/boot";
import { mockCatalog, mockProvider } from "../src/catalog";
import { mockTheme } from "../src/theme";

const theme = mockTheme({
  tokens: { white: "#fff", black: "#000", surface: "{white}" },
  modifiers: { color: { light: {}, dark: { surface: "{black}" } } },
});

const layers: Layer<typeof theme>[] = [
  { id: "bravo", name: "Bravo", tokens: { surface: "{black}" } },
  { id: "alpha", name: "Alpha" },
  { id: "charlie", name: "Charlie Night", tokens: { white: "#eee" } },
];

describe("mockProvider", () => {
  it("lists every layer's entry in the listing's order and window", () => {
    const provider = mockProvider(layers);
    expect(
      provider.list({
        sort: { field: "name", direction: "asc" },
        limit: 20,
        offset: 0,
      }),
    ).toEqual({
      entries: [
        { id: "alpha", name: "Alpha" },
        { id: "bravo", name: "Bravo" },
        { id: "charlie", name: "Charlie Night" },
      ],
      total: 3,
      limit: 20,
      offset: 0,
    });
    expect(
      provider.list({
        sort: { field: "id", direction: "desc" },
        limit: 1,
        offset: 1,
      }),
    ).toEqual({
      entries: [{ id: "bravo", name: "Bravo" }],
      total: 3,
      limit: 1,
      offset: 1,
    });
  });

  it("filters by name, case-insensitively, before cutting the window", () => {
    const provider = mockProvider(layers);
    expect(
      provider.list({
        search: "night",
        sort: { field: "name", direction: "asc" },
        limit: 20,
        offset: 0,
      }),
    ).toEqual({
      entries: [{ id: "charlie", name: "Charlie Night" }],
      total: 1,
      limit: 20,
      offset: 0,
    });
  });

  it("gets a layer by id, or nothing", () => {
    const provider = mockProvider(layers);
    expect(provider.get("bravo")).toBe(layers[0]);
    expect(provider.get("delta")).toBeUndefined();
  });
});

describe("mockCatalog", () => {
  it("is a catalog over the layers, proving each one on the way out", async () => {
    const untheme = bootUntheme(theme);
    const catalog = mockCatalog(untheme.schema, layers);
    const page = await catalog.list({ search: "a", limit: 2 });
    expect(page.entries.map((entry) => entry.id)).toEqual(["alpha", "bravo"]);
    expect(page.total).toBe(3);

    const bravo = await catalog.get("bravo");
    expect(bravo).toEqual(layers[0]);
    untheme.apply(bravo!);
    expect(untheme.resolve("surface")).toMatchObject({ hex: "#000000" });

    await expect(catalog.get("delta")).resolves.toBeUndefined();
  });

  it("rejects a layer outside the contract", async () => {
    const untheme = bootUntheme(theme);
    const catalog = mockCatalog(untheme.schema, [
      { id: "bad", name: "Bad", tokens: { outline: "{black}" } } as never,
    ]);
    await expect(catalog.get("bad")).rejects.toThrow(MalformedLayerError);
  });
});
