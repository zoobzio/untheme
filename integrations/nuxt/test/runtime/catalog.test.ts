import type { EventHandler } from "h3";

import { createApp, toWebHandler } from "h3";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { themes } from "../fixtures";

/*
 * The Nitro helpers of the handler. The storage holds the server assets of a
 * build. The cache wrapper records its options and passes the handler through.
 */
const nitro = vi.hoisted(() => {
  const files: Record<string, unknown> = {};
  const cache: { options?: unknown } = {};
  return {
    files,
    cache,
    cached: (handler: EventHandler, options: unknown) => {
      cache.options = options;
      return handler;
    },
    getItem: vi.fn(async (key: string) => files[key] ?? null),
    useStorage: vi.fn(),
  };
});

vi.mock("#imports", () => ({
  defineCachedEventHandler: nitro.cached,
  useStorage: nitro.useStorage,
}));

import handler from "../../src/runtime/server/catalog";

/** Serves the handler under the default route and a build id. */
const app = createApp();
app.use("/api/theme/build-1", handler);
const web = toWebHandler(app);
const request = (path: string) =>
  web(new Request(`http://app.test/api/theme/build-1${path}`));

describe("catalog handler", () => {
  beforeEach(() => {
    nitro.getItem.mockClear();
    nitro.useStorage.mockClear();
    nitro.useStorage.mockReturnValue({ getItem: nitro.getItem });
    for (const key of Object.keys(nitro.files)) {
      Reflect.deleteProperty(nitro.files, key);
    }
    nitro.files["layers.json"] = [
      { id: "bravo", name: "Bravo" },
      { id: "charlie", name: "Charlie", description: "Inverted surfaces." },
    ];
    nitro.files["layers/bravo.json"] = themes.bravo;
    nitro.files["layers/charlie.json"] = themes.charlie;
  });

  it("is cached for a year", () => {
    expect(nitro.cache.options).toEqual({
      name: "untheme",
      maxAge: 60 * 60 * 24 * 365,
    });
  });

  it("lists the entries from the entries file", async () => {
    const response = await request("/themes");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      entries: nitro.files["layers.json"],
      total: 2,
      limit: 20,
      offset: 0,
    });
    expect(nitro.useStorage).toHaveBeenCalledWith("assets:untheme");
    expect(nitro.getItem).toHaveBeenCalledWith("layers.json");
  });

  it("lists nothing when the entries file is missing", async () => {
    Reflect.deleteProperty(nitro.files, "layers.json");
    const response = await request("/themes");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ entries: [], total: 0 });
  });

  it("answers a layer from its file", async () => {
    const response = await request("/themes/charlie");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(themes.charlie);
    expect(nitro.getItem).toHaveBeenCalledWith("layers/charlie.json");
  });

  it("misses an id outside the entries without reading a file", async () => {
    const response = await request("/themes/delta");
    expect(response.status).toBe(404);
    expect(nitro.getItem).not.toHaveBeenCalledWith("layers/delta.json");
    expect(nitro.getItem).toHaveBeenCalledTimes(1);
  });

  it("never reads a path outside the layers", async () => {
    const response = await request("/themes/..%2Flayers.json");
    expect(response.status).toBe(404);
    expect(nitro.getItem).toHaveBeenCalledTimes(1);
  });
});
