import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, nextTick, type Ref } from "vue";
import { clone } from "untheme";
import { theme, themes } from "../fixtures";

let states: Record<string, Ref<unknown>>;
let cookies: Record<string, { value: unknown }>;
let nuxtApp: { callHook: ReturnType<typeof vi.fn> };

// A getter clones on every access so each `makeUntheme` seeds a fresh theme;
// otherwise mutations from one test (the service writes through the reactive
// proxy) would pollute the shared baseline read by the next.
vi.mock("#build/untheme.mjs", () => ({
  get theme() {
    return clone(theme);
  },
  themes,
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

  it("reflects the initial mode, theme, and tokens", () => {
    const u = make();
    expect(u.config.mode).toBe("dark");
    expect(u.config.theme.id).toBe("alpha");
    expect(u.tokens().primary).toBe("indigo");
  });

  describe("config.mode", () => {
    it("updates the service and persists the cookie", () => {
      const u = make();
      u.config.mode = "light";
      expect(u.config.mode).toBe("light");
      expect(cookies["untheme-mode"].value).toBe("light");
    });

    it("recomputes tokens when the mode flips", async () => {
      const u = make();
      expect(u.tokens().primary).toBe("indigo");
      u.config.mode = "light";
      await nextTick();
      expect(u.tokens().primary).toBe("blue");
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
  });

  describe("set / update", () => {
    it("set applies the value without emitting or persisting", () => {
      const u = make();
      u.set("text-color", "primary");
      expect(u.get("text-color")).toBe("primary");
      expect(nuxtApp.callHook).not.toHaveBeenCalled();
      expect(cookies["untheme-key"]?.value ?? null).toBeNull();
    });

    it("update merges a patch and emits untheme:theme", () => {
      const u = make();
      u.update({ reference: { white: "#eeeeee" } });
      expect(u.config.theme.reference.white).toBe("#eeeeee");
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:theme",
        expect.objectContaining({ id: "alpha" }),
      );
    });
  });

  describe("reset", () => {
    it("restores the theme and emits untheme:theme", () => {
      const u = make();
      u.set("text-color", "primary");
      u.reset();
      expect(u.get("text-color")).not.toBe("primary");
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:theme",
        expect.objectContaining({ id: "alpha" }),
      );
    });
  });
});
