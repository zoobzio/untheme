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

import { makeNuxtUntheme } from "../../src/runtime/client";

const make = () => makeNuxtUntheme(nuxtApp as never);

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

  it("exposes the instrumented service surface", () => {
    const u = make();
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
    ]) {
      expect(u).toHaveProperty(key);
    }
  });

  it("reflects the initial input, theme, and tokens", () => {
    const u = make();
    expect(u.config.input.color).toBe("light");
    expect(u.config.patch).toEqual({});
    expect(u.theme().id).toBe("alpha");
    expect(u.tokens().primary).toBe("{blue}");
  });

  it("keeps the base theme out of the state", () => {
    make();
    const state = states["untheme:config"]?.value as Record<string, unknown>;
    expect(Object.keys(state).sort()).toEqual(["input", "patch"]);
  });

  describe("swap", () => {
    it("updates the selection and persists the cookie", () => {
      const u = make();
      u.swap("color", "dark");
      expect(u.config.input.color).toBe("dark");
      expect(cookies["untheme-input"]?.value).toEqual({ color: "dark" });
    });

    it("recomputes tokens when the context flips", async () => {
      const u = make();
      expect(u.tokens().primary).toBe("{blue}");
      u.swap("color", "dark");
      await nextTick();
      expect(u.tokens().primary).toBe("{indigo}");
    });
  });

  describe("apply", () => {
    it("stores the layer as the patch, persists the key cookie, and emits untheme:patch", () => {
      const u = make();
      u.apply(bravo);
      expect(u.theme().id).toBe("bravo");
      expect(u.config.patch).toEqual(bravo);
      expect(states["untheme:config"]?.value).toMatchObject({ patch: bravo });
      expect(cookies["untheme-key"]?.value).toBe("bravo");
      expect(nuxtApp.callHook).toHaveBeenCalledWith("untheme:patch", bravo);
    });

    it("resolves a layer-carried modifier override on top of the baseline", () => {
      const u = make();
      u.swap("color", "dark");
      expect(u.tokens().primary).toBe("{indigo}");
      u.apply(bravo);
      expect(u.tokens().primary).toBe("{blue}");
      expect(u.tokens().surface).toBe("{black}");
    });
  });

  describe("update", () => {
    it("update rebinds a token through the patch and emits untheme:patch", () => {
      const u = make();
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
});
