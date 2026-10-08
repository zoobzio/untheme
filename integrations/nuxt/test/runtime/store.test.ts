import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, type Ref } from "vue";
import { theme, input } from "../fixtures";

let states: Record<string, Ref<unknown>>;
let cookies: Record<string, { value: unknown }>;

vi.mock("#build/untheme/config.mjs", () => ({ theme, input }));

vi.mock("#imports", () => ({
  useState: (key: string, init: () => unknown) => (states[key] ??= ref(init())),
  useCookie: (key: string) => (cookies[key] ??= reactive({ value: null })),
}));

import { accessUntheme, buildTheme } from "../../src/runtime/store";

describe("accessUntheme", () => {
  beforeEach(() => {
    states = {};
    cookies = {};
  });

  it("seeds state with a detached copy of the build selection and nothing else", () => {
    const store = accessUntheme();

    expect(store.config.value).toEqual({ patch: {}, input });
    expect(store.config.value.input).not.toBe(input);
  });

  it("keeps writes into the seeded state away from the build module", () => {
    const store = accessUntheme();
    store.config.value.input.color = "dark";

    expect(input.color).toBe("light");
  });

  it("exposes the build theme as the base, by reference", () => {
    expect(buildTheme).toBe(theme);
  });
});
