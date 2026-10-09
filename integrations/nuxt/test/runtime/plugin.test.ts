import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, nextTick, type Ref } from "vue";
import type { AppUnthemeConfig } from "../../src/runtime/types";
import { theme, themes, input } from "../fixtures";

interface HeadInput {
  htmlAttrs: Record<string, { value: string }>;
  style: { value: Array<{ key: string; innerHTML: string }> };
}

const headCalls: HeadInput[] = [];
let config: Ref<AppUnthemeConfig>;
let cookies: Record<string, { value: unknown }>;
const callHook = vi.fn();

vi.mock("#build/untheme/config.mjs", () => ({
  get theme() {
    return structuredClone(theme);
  },
  get input() {
    return structuredClone(input);
  },
}));

vi.mock("#app", () => ({
  defineNuxtPlugin: (def: unknown) => def,
}));

vi.mock("#build/untheme/layers.mjs", () => ({ layers: [], load: {} }));

vi.mock("#imports", () => ({
  useState: (key: string, init: () => AppUnthemeConfig) => {
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

const setup = async () => {
  const result = await plugin.setup({ callHook } as never);
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

  it("provides the untheme service", async () => {
    const provide = await setup();
    expect(provide.untheme).toBeDefined();
  });

  it("provides the renderer bound to the service", async () => {
    const provide = await setup();
    expect(provide.unthemeRenderer).toBeDefined();
  });

  it("mirrors the selection as data attributes and injects no CSS", async () => {
    await setup();
    expect(headCalls[0]?.htmlAttrs["data-color"]?.value).toBe("light");
    expect(headCalls[0]?.style.value).toEqual([]);
  });

  it("emits untheme:ready with the service", async () => {
    const provide = await setup();
    expect(callHook).toHaveBeenCalledWith("untheme:ready", provide.untheme);
  });

  describe("reactivity", () => {
    it("updates the data attribute when the context changes", async () => {
      await setup();
      expect(headCalls[0]?.htmlAttrs["data-color"]?.value).toBe("light");
      config.value.input.color = "dark";
      await nextTick();
      expect(headCalls[0]?.htmlAttrs["data-color"]?.value).toBe("dark");
    });

    it("renders no CSS when the context changes", async () => {
      await setup();
      config.value.input.color = "dark";
      await nextTick();
      expect(headCalls[0]?.style.value).toEqual([]);
    });

    it("renders only the bindings of an applied layer", async () => {
      const provide = await setup();
      const charlie = themes.charlie;
      if (charlie === undefined) {
        throw new Error("expected the charlie theme fixture");
      }
      (provide.untheme as { apply: (layer: unknown) => void }).apply(charlie);
      await nextTick();
      const css = headCalls[0]?.style.value[0]?.innerHTML;
      expect(headCalls[0]?.style.value[0]?.key).toBe("untheme");
      expect(css).toContain(":root {");
      expect(css).toContain("--surface: var(--black);");
      expect(css).toContain("--on-surface: var(--white);");
      expect(css).not.toContain("--white: #ffffff;");
      expect(css).not.toContain("--primary:");
    });

    it("renders only the tokens of a patch, and nothing once it is reset", async () => {
      const provide = await setup();
      const service = provide.untheme as {
        update: (patch: unknown) => void;
        config: { patch: unknown };
      };
      service.update({ tokens: { primary: "{indigo}" } });
      await nextTick();
      const css = headCalls[0]?.style.value[0]?.innerHTML;
      expect(css).toBe(":root {\n --primary: var(--indigo);\n}");
      service.config.patch = {};
      await nextTick();
      expect(headCalls[0]?.style.value).toEqual([]);
    });
  });
});
