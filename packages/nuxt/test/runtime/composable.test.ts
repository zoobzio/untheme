import { describe, it, expect, vi, beforeEach } from "vitest";
import { reactive, nextTick, type Ref } from "vue";
import { defineUntheme, clone, type Mode } from "untheme";
import type { AppConfig, AppUntheme } from "../../src/runtime/types";
import { theme, themes } from "../fixtures";

let cookies: Record<string, Ref<unknown>>;
let service: AppUntheme;
let nuxtApp: { $untheme: AppUntheme; callHook: ReturnType<typeof vi.fn> };

vi.mock("#build/untheme.mjs", () => ({ theme, themes }));

vi.mock("#app", () => ({
  useNuxtApp: () => nuxtApp,
}));

vi.mock("#imports", () => ({
  useCookie: (key: string) => {
    cookies[key] ??= reactive({ value: null }) as unknown as Ref<unknown>;
    return cookies[key];
  },
}));

import { useUntheme } from "../../src/runtime/composable";

describe("useUntheme", () => {
  beforeEach(() => {
    cookies = {};
    const config = reactive<AppConfig>({ mode: "dark", theme: clone(theme) });
    service = defineUntheme(config, themes);
    nuxtApp = { $untheme: service, callHook: vi.fn() };
  });

  it("exposes reactive state and the instrumented actions", () => {
    const u = useUntheme();
    for (const key of [
      "mode",
      "theme",
      "tokens",
      "themes",
      "setMode",
      "apply",
      "set",
      "update",
      "reset",
      "create",
      "extract",
      "get",
      "resolve",
    ]) {
      expect(u).toHaveProperty(key);
    }
  });

  it("reflects the service's current mode, theme, and tokens", () => {
    const { mode, theme: active, tokens } = useUntheme();
    expect(mode.value).toBe("dark");
    expect(active.value.id).toBe("alpha");
    expect(tokens.value.primary).toBe("indigo");
  });

  describe("setMode", () => {
    it("updates the service, persists the cookie, and emits untheme:mode", () => {
      const { setMode, mode } = useUntheme();
      setMode("light");
      expect(service.config.mode).toBe("light");
      expect(mode.value).toBe("light");
      expect(cookies["untheme-mode"].value).toBe("light");
      expect(nuxtApp.callHook).toHaveBeenCalledWith("untheme:mode", "light");
    });

    it("recomputes tokens when the mode flips", async () => {
      const { setMode, tokens } = useUntheme();
      expect(tokens.value.primary).toBe("indigo");
      setMode("light");
      await nextTick();
      expect(tokens.value.primary).toBe("blue");
    });
  });

  describe("apply", () => {
    it("switches theme, persists the key cookie, and emits untheme:apply", () => {
      const { apply, theme: active } = useUntheme();
      apply("bravo");
      expect(service.config.theme.id).toBe("bravo");
      expect(active.value.id).toBe("bravo");
      expect(cookies["untheme-key"].value).toBe("bravo");
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:apply",
        expect.objectContaining({ id: "bravo" }),
      );
    });
  });

  describe("set / update", () => {
    it("set delegates to the service and emits untheme:set without a cookie", () => {
      const { set } = useUntheme();
      set("text-color", "primary");
      expect(service.get("text-color")).toBe("primary");
      expect(nuxtApp.callHook).toHaveBeenCalledWith(
        "untheme:set",
        "text-color",
        "primary",
      );
      expect(cookies["untheme-key"].value).toBeNull();
    });

    it("update merges a patch and emits untheme:update", () => {
      const { update } = useUntheme();
      update({ reference: { white: "#eeeeee" } });
      expect(service.config.theme.reference.white).toBe("#eeeeee");
      expect(nuxtApp.callHook).toHaveBeenCalledWith("untheme:update", {
        reference: { white: "#eeeeee" },
      });
    });
  });

  describe("reset", () => {
    it("delegates to the service and emits untheme:reset", () => {
      const { set, reset } = useUntheme();
      set("text-color", "primary");
      reset();
      expect(service.get("text-color")).not.toBe("primary");
      expect(nuxtApp.callHook).toHaveBeenCalledWith("untheme:reset");
    });
  });

  it("guards the mode union at the type level", () => {
    const { setMode } = useUntheme();
    const mode: Mode = "light";
    setMode(mode);
    expect(service.config.mode).toBe("light");
  });
});
