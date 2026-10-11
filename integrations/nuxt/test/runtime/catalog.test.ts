import { describe, it, expect, vi, beforeEach } from "vitest";

import { themes } from "../fixtures";

/** A schema that accepts every layer, and records what it inspected. */
const schema = {
  inspect: {
    layer: vi.fn((value: unknown) => ({ success: true, data: value })),
  },
};

/** The layers module of the build, with a loader for each layer. */
const build = vi.hoisted(() => ({
  bravo: vi.fn(),
  charlie: vi.fn(),
}));

vi.mock("#build/untheme/layers.mjs", async () => {
  const { themes } = await import("../fixtures");
  build.bravo.mockResolvedValue(themes.bravo);
  build.charlie.mockResolvedValue(themes.charlie);
  return {
    layers: [
      { id: "charlie", name: "Charlie", description: "Inverted surfaces." },
      { id: "bravo", name: "Bravo" },
    ],
    load: { bravo: build.bravo, charlie: build.charlie },
  };
});

import { layers } from "#build/untheme/layers.mjs";
import { makeCatalog } from "../../src/runtime/catalog";

describe("makeCatalog", () => {
  const catalog = makeCatalog(schema as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pages the entries of the layers module", async () => {
    const page = await catalog.list({ limit: 1 });
    expect(page).toEqual({
      entries: [{ id: "bravo", name: "Bravo" }],
      total: 2,
      limit: 1,
      offset: 0,
    });
    expect(build.bravo).not.toHaveBeenCalled();
  });

  it("filters by name, case-insensitively, with honest totals", async () => {
    const page = await catalog.list({ search: "AR" });
    expect(page.entries.map((entry) => entry.id)).toEqual(["charlie"]);
    expect(page.total).toBe(1);
  });

  it("orders by the field and direction of the query", async () => {
    const page = await catalog.list({
      sort: { field: "id", direction: "desc" },
    });
    expect(page.entries.map((entry) => entry.id)).toEqual(["charlie", "bravo"]);
  });

  it("keeps the entries of the layers module untouched", async () => {
    const before = structuredClone(layers);
    await catalog.list({ sort: { field: "id", direction: "asc" } });
    expect(layers).toEqual(before);
  });

  it("imports a layer on demand and checks it against the contract", async () => {
    const layer = await catalog.get("charlie");
    expect(layer).toEqual(themes.charlie);
    expect(build.charlie).toHaveBeenCalledOnce();
    expect(schema.inspect.layer).toHaveBeenCalledWith(themes.charlie);
  });

  it("misses an id outside the build", async () => {
    expect(await catalog.get("delta")).toBeUndefined();
    expect(await catalog.get("constructor")).toBeUndefined();
  });
});
