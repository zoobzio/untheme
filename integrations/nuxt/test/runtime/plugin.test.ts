import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, nextTick, type Ref } from "vue";
import type { AppConfig } from "../../src/runtime/types";
import { theme, themes, input } from "../fixtures";

interface HeadInput {
  htmlAttrs: Record<string, { value: string }>;
  style: { value: Array<{ key: string; innerHTML: string }> };
}

const headCalls: HeadInput[] = [];
let config: Ref<AppConfig>;
let cookies: Record<string, { value: unknown }>;
const callHook = vi.fn();

vi.mock("#build/untheme.mjs", () => ({
  get theme() {
    return structuredClone(theme);
  },
  get input() {
    return structuredClone(input);
  },
  themes,
}));

vi.mock("#app", () => ({
  defineNuxtPlugin: (def: unknown) => def,
}));

vi.mock("#imports", () => ({
  useState: (key: string, init: () => AppConfig) => {
    const state = ref(init());
    if (key === "untheme:config") config = state;
    return state;
  },
  useCookie: (key: string) => (cookies[key] ??= reactive({ value: null })),
  useHead: (input: HeadInput) => {
    headCalls.push(input);
  },
}));

import plugin from "../../src/runtime/plugin";

const setup = () => {
  const result = plugin.setup({ callHook } as never);
  if (
    !result ||
    typeof result !== "object" ||
    !("provide" in result) ||
    !result.provide
  ) {
    throw new Error("plugin did not provide a service");
  }
  return result.provide;
};

describe("untheme plugin", () => {
  beforeEach(() => {
    headCalls.length = 0;
    cookies = {};
    callHook.mockClear();
  });

  it("is named untheme", () => {
    expect(plugin.name).toBe("untheme");
  });

  it("provides the untheme service", () => {
    const provide = setup();
    expect(provide.untheme).toBeDefined();
  });

  it("mirrors the selection as data attributes and injects token CSS", () => {
    setup();
    expect(headCalls[0].htmlAttrs["data-color"].value).toBe("light");
    expect(headCalls[0].style.value[0].key).toBe("untheme");
    const css = headCalls[0].style.value[0].innerHTML;
    expect(css).toContain(":root {");
    expect(css).toContain("--white: #ffffff;");
    expect(css).toContain("--primary: var(--blue);");
  });

  it("emits untheme:ready with the service", () => {
    const provide = setup();
    expect(callHook).toHaveBeenCalledWith("untheme:ready", provide.untheme);
  });

  describe("reactivity", () => {
    it("updates the data attribute when the context changes", async () => {
      setup();
      expect(headCalls[0].htmlAttrs["data-color"].value).toBe("light");
      config.value.input.color = "dark";
      await nextTick();
      expect(headCalls[0].htmlAttrs["data-color"].value).toBe("dark");
    });

    it("re-renders the token CSS when the context changes", async () => {
      setup();
      expect(headCalls[0].style.value[0].innerHTML).toContain(
        "--primary: var(--blue);",
      );
      config.value.input.color = "dark";
      await nextTick();
      expect(headCalls[0].style.value[0].innerHTML).toContain(
        "--primary: var(--indigo);",
      );
    });
  });
});
