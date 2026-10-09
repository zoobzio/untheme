import { describe, it, expect, vi, beforeEach } from "vitest";

import { themes } from "../fixtures";

/** A schema that accepts every layer, and records what it inspected. */
const schema = {
  inspect: {
    layer: vi.fn((value: unknown) => ({ success: true, data: value })),
  },
};
const service = { marker: "untheme", schema };
const renderer = { marker: "renderer" };
const nuxtApp = { $untheme: service, $unthemeRenderer: renderer };

vi.mock("#app", () => ({
  useNuxtApp: () => nuxtApp,
}));

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

import {
  useUntheme,
  useUnthemeCatalog,
  useUnthemeRenderer,
} from "../../src/runtime/composable";

describe("useUntheme", () => {
  it("returns the $untheme service from the nuxt app", () => {
    expect(useUntheme()).toBe(service);
  });
});

describe("useUnthemeRenderer", () => {
  it("returns the $unthemeRenderer from the nuxt app", () => {
    expect(useUnthemeRenderer()).toBe(renderer);
  });
});

describe("useUnthemeCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pages the entries of the layers module", async () => {
    const page = await useUnthemeCatalog().list({ limit: 1 });
    expect(page).toEqual({
      entries: [{ id: "bravo", name: "Bravo" }],
      total: 2,
      limit: 1,
      offset: 0,
    });
    expect(build.bravo).not.toHaveBeenCalled();
  });

  it("imports a layer on demand and checks it against the contract", async () => {
    const layer = await useUnthemeCatalog().get("charlie");
    expect(layer).toEqual(themes.charlie);
    expect(build.charlie).toHaveBeenCalledOnce();
    expect(schema.inspect.layer).toHaveBeenCalledWith(themes.charlie);
  });

  it("misses an id outside the build", async () => {
    expect(await useUnthemeCatalog().get("delta")).toBeUndefined();
    expect(await useUnthemeCatalog().get("constructor")).toBeUndefined();
  });
});
