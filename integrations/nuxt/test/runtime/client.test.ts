import type { Color } from "untheme";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, nextTick, type Ref } from "vue";
import { theme, themes, input } from "../fixtures";

let states: Record<string, Ref<unknown>>;
let cookies: Record<string, { value: unknown }>;
let nuxtApp: { callHook: ReturnType<typeof vi.fn> };

// The getter returns a new clone of the theme on each access.
vi.mock("#build/untheme/config.mjs", () => ({
  get theme() {
    return structuredClone(theme);
  },
  input,
}));

vi.mock("#imports", () => ({
  useState: (key: string, init: () => unknown) => (states[key] ??= ref(init())),
  useCookie: (key: string) => (cookies[key] ??= reactive({ value: null })),
}));

/** The layers module of the build: the entries and a loader for each layer. */
const build = vi.hoisted(() => ({ bravo: vi.fn(), charlie: vi.fn() }));

vi.mock("#build/untheme/layers.mjs", async () => {
  const { themes } = await import("../fixtures");
  build.bravo.mockImplementation(async () => structuredClone(themes.bravo));
  build.charlie.mockImplementation(async () => structuredClone(themes.charlie));
  return {
    layers: [
      { id: "bravo", name: "Bravo" },
      { id: "charlie", name: "Charlie", description: "Inverted surfaces." },
    ],
    load: { bravo: build.bravo, charlie: build.charlie },
  };
});

import { makeNuxtUntheme } from "../../src/runtime/client";

const make = () => makeNuxtUntheme(nuxtApp as never);

/** Runs `fn` as on the server, where the cookies restore the state. */
const onServer = async <T>(fn: () => Promise<T>): Promise<T> => {
  Reflect.set(globalThis, "__untheme_server__", true);
  try {
    return await fn();
  } finally {
    Reflect.set(globalThis, "__untheme_server__", false);
  }
};

const bravo = themes.bravo;
if (bravo === undefined) {
  throw new Error("expected the bravo theme fixture");
}

describe("makeNuxtUntheme", () => {
  beforeEach(() => {
    states = {};
    cookies = {};
    nuxtApp = { callHook: vi.fn() };
  });

  it("exposes the instrumented service surface", async () => {
    const u = await make();
    for (const key of [
      "config",
      "schema",
      "theme",
      "modifiers",
      "contexts",
      "tokens",
      "get",
      "resolve",
      "swap",
      "delta",
      "update",
      "apply",
      "create",
      "extract",
      "layers",
      "select",
    ]) {
      expect(u).toHaveProperty(key);
    }
  });

  it("reflects the initial input, theme, and tokens", async () => {
    const u = await make();
    expect(u.config.input.color).toBe("light");
    expect(u.config.patch).toEqual({});
    expect(u.theme().id).toBe("alpha");
    expect(u.tokens().primary).toBe("{blue}");
  });

  it("keeps the base theme out of the state", async () => {
    await make();
    const state = states["untheme:config"]?.value as Record<string, unknown>;
    expect(Object.keys(state).sort()).toEqual(["input", "patch"]);
  });

  describe("swap", () => {
    it("updates the selection and persists the cookie", async () => {
      const u = await make();
      u.swap("color", "dark");
      expect(u.config.input.color).toBe("dark");
      expect(cookies["untheme-input"]?.value).toEqual({ color: "dark" });
    });

    it("recomputes tokens when the context flips", async () => {
      const u = await make();
      expect(u.tokens().primary).toBe("{blue}");
      u.swap("color", "dark");
      await nextTick();
      expect(u.tokens().primary).toBe("{indigo}");
    });
  });

  describe("apply", () => {
    it("stores the layer as the patch, persists the key cookie, and emits untheme:patch", async () => {
      const u = await make();
      u.apply(bravo);
      expect(u.theme().id).toBe("bravo");
      expect(u.config.patch).toEqual(bravo);
      expect(states["untheme:config"]?.value).toMatchObject({ patch: bravo });
      expect(cookies["untheme-key"]?.value).toBe("bravo");
      expect(nuxtApp.callHook).toHaveBeenCalledWith("untheme:patch", bravo);
    });

    it("resolves a layer-carried modifier override on top of the baseline", async () => {
      const u = await make();
      u.swap("color", "dark");
      expect(u.tokens().primary).toBe("{indigo}");
      u.apply(bravo);
      expect(u.tokens().primary).toBe("{blue}");
      expect(u.tokens().surface).toBe("{black}");
    });
  });

  describe("update", () => {
    it("update rebinds a token through the patch and emits untheme:patch", async () => {
      const u = await make();
      const smoke: Color = {
        colorSpace: "srgb",
        components: [0.93, 0.93, 0.93],
      };
      u.update({ tokens: { white: smoke } });
      expect(u.theme().tokens.white.$value).toEqual(smoke);
      expect(u.theme().tokens.white.$type).toBe("color");
      expect(u.config.patch.id).toBeUndefined();
      expect(u.config.patch.tokens).toEqual({ white: smoke });
      expect(cookies["untheme-key"]?.value ?? null).toBeNull();
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:patch",
        expect.objectContaining({ tokens: { white: smoke } }),
      );
    });
  });

  describe("layers", () => {
    it("lists the layers of the build", async () => {
      const u = await make();
      expect(u.layers.map((entry) => entry.id)).toEqual(["bravo", "charlie"]);
    });
  });

  describe("select", () => {
    it("loads a layer by id and applies it", async () => {
      const u = await make();
      const layer = await u.select("charlie");
      expect(layer).toEqual(themes.charlie);
      expect(u.theme().id).toBe("charlie");
      expect(cookies["untheme-key"]?.value).toBe("charlie");
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:patch",
        themes.charlie,
      );
    });

    it("leaves the state alone on a miss", async () => {
      const u = await make();
      expect(await u.select("delta")).toBeUndefined();
      expect(u.theme().id).toBe("alpha");
      expect(cookies["untheme-key"]?.value ?? null).toBeNull();
    });

    it("loads nothing until asked", async () => {
      await make();
      expect(build.bravo).not.toHaveBeenCalled();
      expect(build.charlie).not.toHaveBeenCalled();
    });
  });

  describe("on the server", () => {
    it("restores the selection from the input cookie", async () => {
      cookies["untheme-input"] = reactive({ value: { color: "dark" } });
      const u = await onServer(make);
      expect(u.config.input.color).toBe("dark");
    });

    it("clears an input cookie outside the contract", async () => {
      cookies["untheme-input"] = reactive({ value: { color: "banana" } });
      const u = await onServer(make);
      expect(u.config.input.color).toBe("light");
      expect(cookies["untheme-input"]?.value).toBeNull();
    });

    it("restores the layer from the key cookie without a write", async () => {
      cookies["untheme-key"] = reactive({ value: "bravo" });
      const u = await onServer(make);
      expect(u.theme().id).toBe("bravo");
      expect(u.config.patch).toEqual(bravo);
      expect(build.bravo).toHaveBeenCalledOnce();
      expect(nuxtApp.callHook).not.toHaveBeenCalled();
    });

    it("clears a key cookie that names no layer of the build", async () => {
      cookies["untheme-key"] = reactive({ value: "delta" });
      const u = await onServer(make);
      expect(u.theme().id).toBe("alpha");
      expect(cookies["untheme-key"]?.value).toBeNull();
    });

    it("clears a key cookie whose layer fails the contract", async () => {
      build.bravo.mockResolvedValueOnce({
        id: "bravo",
        name: "Bravo",
        tokens: { nope: 1 },
      });
      cookies["untheme-key"] = reactive({ value: "bravo" });
      const u = await onServer(make);
      expect(u.theme().id).toBe("alpha");
      expect(cookies["untheme-key"]?.value).toBeNull();
    });

    it("reads no cookie on the client", async () => {
      cookies["untheme-key"] = reactive({ value: "bravo" });
      const u = await make();
      expect(u.theme().id).toBe("alpha");
      expect(build.bravo).not.toHaveBeenCalled();
    });
  });
});
