import { describe, it, expect, vi, beforeEach } from "vitest";
import { reactive, type Ref } from "vue";
import { defineUntheme, clone } from "untheme";
import type { AppConfig, AppUntheme } from "../../src/runtime/types";
import { theme, themes } from "../fixtures";

let cookies: Record<string, Ref<unknown>>;
let service: AppUntheme;
let nuxtApp: { $untheme: AppUntheme; callHook: ReturnType<typeof vi.fn> };

vi.mock("#build/untheme.mjs", () => ({ theme, themes }));

vi.mock("#app", () => ({
  defineNuxtPlugin: (def: unknown) => def,
}));

vi.mock("#imports", () => ({
  useCookie: (key: string) => {
    cookies[key] ??= reactive({ value: null }) as unknown as Ref<unknown>;
    return cookies[key];
  },
}));

import plugin from "../../src/runtime/plugin.server";

const setup = () => plugin.setup(nuxtApp as never);

describe("untheme cookie plugin", () => {
  beforeEach(() => {
    cookies = {};
    const config = reactive<AppConfig>({ mode: "dark", theme: clone(theme) });
    service = defineUntheme(config, themes);
    nuxtApp = { $untheme: service, callHook: vi.fn() };
  });

  it("is named untheme:cookie and depends on the main plugin", () => {
    expect(plugin.name).toBe("untheme:cookie");
    expect(plugin.dependsOn).toContain("untheme");
  });

  it("restores the mode from the cookie", () => {
    cookies["untheme-mode"] = reactive({ value: "light" }) as never;
    setup();
    expect(service.config.mode).toBe("light");
  });

  it("applies the theme from the key cookie and emits untheme:apply", () => {
    cookies["untheme-key"] = reactive({ value: "bravo" }) as never;
    setup();
    expect(service.config.theme.id).toBe("bravo");
    expect(nuxtApp.callHook).toHaveBeenCalledWith(
      "untheme:apply",
      expect.objectContaining({ id: "bravo" }),
    );
  });

  it("does nothing when no cookies are set", () => {
    setup();
    expect(service.config.mode).toBe("dark");
    expect(service.config.theme.id).toBe("alpha");
    expect(nuxtApp.callHook).not.toHaveBeenCalled();
  });
});
