import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick, type Ref } from "vue";
import type { AppConfig } from "../../src/runtime/types";
import { theme, themes } from "../fixtures";

interface HeadInput {
  htmlAttrs: { class: { value: string } };
  style: { value: Array<{ key: string; innerHTML: string }> };
}

const headCalls: HeadInput[] = [];
let state: Ref<AppConfig>;
const callHook = vi.fn();

vi.mock("#build/untheme.mjs", () => ({ theme, themes }));

vi.mock("#app", () => ({
  defineNuxtPlugin: (def: unknown) => def,
}));

vi.mock("#imports", () => ({
  useState: (_key: string, init: () => AppConfig) => {
    state = ref(init());
    return state;
  },
  useHead: (input: HeadInput) => {
    headCalls.push(input);
  },
}));

vi.mock("untheme/css", () => ({
  generateCSS: (tokens: Record<string, string>) =>
    `/* ${Object.keys(tokens).join(",")} */`,
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
    callHook.mockClear();
  });

  it("is named untheme", () => {
    expect(plugin.name).toBe("untheme");
  });

  it("provides the untheme service", () => {
    const provide = setup();
    expect(provide.untheme).toBeDefined();
  });

  it("injects the dark class and token CSS via useHead", () => {
    setup();
    expect(headCalls[0].htmlAttrs.class.value).toContain("dark");
    expect(headCalls[0].style.value[0].key).toBe("untheme");
    expect(headCalls[0].style.value[0].innerHTML).toContain("white");
  });

  it("emits untheme:ready with the initial theme", () => {
    setup();
    expect(callHook).toHaveBeenCalledWith(
      "untheme:ready",
      expect.objectContaining({ id: "alpha" }),
    );
  });

  describe("reactivity", () => {
    it("toggles the dark class when the mode changes", async () => {
      setup();
      expect(headCalls[0].htmlAttrs.class.value).toContain("dark");
      state.value.mode = "light";
      await nextTick();
      expect(headCalls[0].htmlAttrs.class.value).not.toContain("dark");
    });
  });
});
