import { describe, it, expect, vi, beforeEach } from "vitest";

const service = { marker: "untheme", schema: { marker: "schema" } };
const renderer = { marker: "renderer" };
const nuxtApp = { $untheme: service, $unthemeRenderer: renderer };

vi.mock("#app", () => ({
  useNuxtApp: () => nuxtApp,
}));

/** The runtime config and the request fetch of the app, as the tests set them. */
const runtime = vi.hoisted(() => ({
  public: {} as Record<string, unknown>,
  raw: vi.fn(async () => new Response("{}", { status: 200 })),
}));

vi.mock("#imports", () => ({
  useRuntimeConfig: () => ({ public: runtime.public }),
  useRequestFetch: () => ({ raw: runtime.raw }),
}));

/** `defineClient` as a spy that returns what it was given. */
const catalog = vi.hoisted(() => ({
  defineClient: vi.fn((schema: unknown, client: unknown) => ({
    schema,
    client,
  })),
}));

vi.mock("untheme/catalog", () => catalog);

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
    runtime.public = {};
  });

  it("makes a catalog client for the contract over the served route", async () => {
    runtime.public = { untheme: { route: "/api/untheme" } };
    const made = useUnthemeCatalog() as unknown as {
      schema: unknown;
      client: {
        base: string;
        fetch: (url: string, init?: RequestInit) => Promise<Response>;
      };
    };
    expect(catalog.defineClient).toHaveBeenCalledOnce();
    expect(made.schema).toBe(service.schema);
    expect(made.client.base).toBe("/api/untheme");
    // The client fetches through the request, and a miss stays a response.
    const response = await made.client.fetch("/api/untheme/themes/nord", {
      headers: { accept: "application/json" },
    });
    expect(response.status).toBe(200);
    expect(runtime.raw).toHaveBeenCalledWith("/api/untheme/themes/nord", {
      headers: { accept: "application/json" },
      ignoreResponseError: true,
    });
  });

  it("throws when the module serves no catalog", () => {
    expect(() => useUnthemeCatalog()).toThrow(/no theme catalog is served/);
    runtime.public = { untheme: { route: false } };
    expect(() => useUnthemeCatalog()).toThrow(/no theme catalog is served/);
  });
});
