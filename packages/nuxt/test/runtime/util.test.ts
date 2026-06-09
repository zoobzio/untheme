import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { appTheme } from "../fixtures";

/**
 * Mock state, hoisted so the `vi.mock` factories (which run before the module
 * body) can reference it. `state.payload` shapes what `/themes/{id}.json`
 * returns; `extend` is the build-time config re-applied to every fetched layer.
 */
const h = vi.hoisted(() => {
  const state: { payload: unknown } = { payload: undefined };
  const fetchFn = vi.fn(async () => ({ json: async () => state.payload }));
  const extend = {
    reference: {} as Record<string, string>,
    modes: { light: {}, dark: {} },
    roles: {
      "text-color": "on_surface",
      "text-muted": "neutral",
      "background-color": "surface",
      "border-color": "neutral",
      "link-color": "primary",
      "link-hover": "secondary",
      "button-bg": "primary",
      "button-text": "surface",
      "error-text": "error",
      "success-text": "success",
      "warning-text": "warning",
    },
  };
  return {
    state,
    fetchFn,
    extend,
    ref: ["white", "black", "slate", "blue", "indigo", "red", "green", "amber"],
    sys: [
      "primary",
      "secondary",
      "neutral",
      "surface",
      "on_surface",
      "error",
      "success",
      "warning",
    ],
    role: [
      "text-color",
      "text-muted",
      "background-color",
      "border-color",
      "link-color",
      "link-hover",
      "button-bg",
      "button-text",
      "error-text",
      "success-text",
      "warning-text",
    ],
  };
});

vi.mock("#imports", () => ({ useRequestFetch: () => h.fetchFn }));

vi.mock("#build/untheme.mjs", () => ({
  ref: h.ref,
  sys: h.sys,
  role: h.role,
  extend: h.extend,
}));

vi.mock("#build/types/untheme.d.ts", () => ({}));

let storeTheme: ReturnType<typeof ref<typeof appTheme>>;
let storeMode: ReturnType<typeof ref<"light" | "dark">>;

vi.mock("../../src/runtime/store", () => ({
  accessTheme: () => ({ theme: storeTheme, mode: storeMode }),
}));

import { makeThemeClient, makeUntheme } from "../../src/runtime/util";

/** A theme layer (no roles) as served from `/themes/{id}.json`. */
const layer = {
  preset: appTheme.preset,
  key: "ocean",
  label: "Ocean",
  reference: { ...appTheme.reference },
  modes: {
    light: { ...appTheme.modes.light },
    dark: { ...appTheme.modes.dark },
  },
};

describe("makeThemeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.state.payload = structuredClone(layer);
    h.extend.reference = {};
    h.extend.modes = { light: {}, dark: {} };
  });

  it("fetches the theme layer by id from the public path", async () => {
    const client = makeThemeClient()();
    await client.get("ocean");
    expect(h.fetchFn).toHaveBeenCalledWith("/themes/ocean.json");
  });

  it("re-assembles a complete theme from the fetched layer", async () => {
    const client = makeThemeClient()();
    const theme = await client.get("ocean");
    expect(theme.label).toBe("Ocean");
    expect(theme.reference.blue).toBe(appTheme.reference.blue);
    expect(theme.modes.dark.primary).toBe(appTheme.modes.dark.primary);
  });

  it("applies the configured extend roles to the fetched layer", async () => {
    // The layer carries no roles; they come solely from `extend`.
    const client = makeThemeClient()();
    const theme = await client.get("ocean");
    expect(theme.roles).toEqual(appTheme.roles);
  });

  it("lets extend reference overrides win over the fetched layer", async () => {
    h.extend.reference = { blue: "#123456" };
    const client = makeThemeClient()();
    const theme = await client.get("ocean");
    expect(theme.reference.blue).toBe("#123456");
  });

  it("lets extend mode overrides win over the fetched layer", async () => {
    h.extend.modes = { light: {}, dark: { primary: "red" } };
    const client = makeThemeClient()();
    const theme = await client.get("ocean");
    expect(theme.modes.dark.primary).toBe("red");
  });

  it("rejects a layer that fails partial validation", async () => {
    h.state.payload = {
      ...structuredClone(layer),
      reference: { blue: "not a color" },
    };
    const client = makeThemeClient()();
    await expect(client.get("ocean")).rejects.toThrow();
  });

  it("caches the client across calls", () => {
    const accessor = makeThemeClient();
    expect(accessor()).toBe(accessor());
  });
});

describe("makeUntheme", () => {
  beforeEach(() => {
    storeTheme = ref(structuredClone(appTheme));
    storeMode = ref("dark");
  });

  it("builds a reactive service from the store state", () => {
    const service = makeUntheme()();
    expect(service.mode).toBe("dark");
    expect(service.tokens.primary).toBe(appTheme.modes.dark.primary);
  });

  it("caches the underlying service across calls", () => {
    const accessor = makeUntheme();
    const first = accessor();
    first.mode = "light";
    // A second call returns the same cached service, not a fresh build.
    expect(accessor().mode).toBe("light");
  });
});
