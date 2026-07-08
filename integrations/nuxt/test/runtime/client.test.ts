import type { Color } from "untheme";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, nextTick, type Ref } from "vue";
import { theme, themes, input } from "../fixtures";

let states: Record<string, Ref<unknown>>;
let cookies: Record<string, { value: unknown }>;
let nuxtApp: { callHook: ReturnType<typeof vi.fn> };

// A getter clones on every access so each `makeUntheme` seeds a fresh theme;
// otherwise mutations from one test (the service writes through the reactive
// proxy) would pollute the shared baseline read by the next.
vi.mock("#build/untheme.mjs", () => ({
  get theme() {
    return structuredClone(theme);
  },
  themes,
  input,
}));

vi.mock("#imports", () => ({
  useState: (key: string, init: () => unknown) => (states[key] ??= ref(init())),
  useCookie: (key: string) => (cookies[key] ??= reactive({ value: null })),
}));

import { makeUntheme } from "../../src/runtime/client";

const make = () => makeUntheme(nuxtApp as never);

describe("makeUntheme", () => {
  beforeEach(() => {
    states = {};
    cookies = {};
    nuxtApp = { callHook: vi.fn() };
  });

  it("exposes the instrumented service surface", () => {
    const u = make();
    for (const key of [
      "config",
      "themes",
      "schema",
      "tokens",
      "get",
      "resolve",
      "swap",
      "dirty",
      "set",
      "update",
      "apply",
      "create",
      "extract",
      "reset",
    ]) {
      expect(u).toHaveProperty(key);
    }
  });

  it("reflects the initial input, theme, and tokens", () => {
    const u = make();
    expect(u.config.input.color).toBe("light");
    expect(u.config.theme.id).toBe("alpha");
    expect(u.tokens().primary).toBe("{blue}");
  });

  describe("swap", () => {
    it("updates the selection and persists the cookie", () => {
      const u = make();
      u.swap("color", "dark");
      expect(u.config.input.color).toBe("dark");
      expect(cookies["untheme-input"].value).toEqual({ color: "dark" });
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
    it("switches theme, persists the key cookie, and emits untheme:theme", () => {
      const u = make();
      u.apply(themes.bravo);
      expect(u.config.theme.id).toBe("bravo");
      expect(cookies["untheme-key"].value).toBe("bravo");
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:theme",
        expect.objectContaining({ id: "bravo" }),
      );
    });

    it("resolves a layer-carried modifier override on top of the baseline", () => {
      const u = make();
      u.swap("color", "dark");
      expect(u.tokens().primary).toBe("{indigo}");
      u.apply(themes.bravo);
      expect(u.tokens().primary).toBe("{blue}");
      expect(u.tokens().surface).toBe("{black}");
    });
  });

  describe("set / update", () => {
    it("set applies the value without emitting or persisting", () => {
      const u = make();
      u.set("primary", "{indigo}");
      expect(u.get("primary")).toBe("{indigo}");
      expect(nuxtApp.callHook).not.toHaveBeenCalled();
      expect(cookies["untheme-key"]?.value ?? null).toBeNull();
    });

    it("update rebinds a token and emits untheme:theme", () => {
      const u = make();
      const smoke: Color = {
        colorSpace: "srgb",
        components: [0.93, 0.93, 0.93],
      };
      u.update({ tokens: { white: smoke } });
      expect(u.config.theme.tokens.white.$value).toEqual(smoke);
      expect(u.config.theme.tokens.white.$type).toBe("color");
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:theme",
        expect.objectContaining({ id: "alpha" }),
      );
    });
  });

  describe("reset", () => {
    it("clears the override without emitting or persisting", () => {
      const u = make();
      u.set("primary", "{indigo}");
      expect(u.dirty()).toBe(true);
      u.reset();
      expect(u.dirty()).toBe(false);
      expect(u.get("primary")).toBe("{blue}");
      expect(nuxtApp.callHook).not.toHaveBeenCalled();
    });
  });
});
