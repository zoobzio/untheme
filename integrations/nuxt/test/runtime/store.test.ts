import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, type Ref } from "vue";
import { theme, input } from "../fixtures";

let states: Record<string, Ref<unknown>>;
let cookies: Record<string, { value: unknown }>;

vi.mock("#build/untheme.mjs", () => ({ theme, input }));

vi.mock("#imports", () => ({
  useState: (key: string, init: () => unknown) => (states[key] ??= ref(init())),
  useCookie: (key: string) => (cookies[key] ??= reactive({ value: null })),
}));

import { accessUntheme } from "../../src/runtime/store";

describe("accessUntheme", () => {
  beforeEach(() => {
    states = {};
    cookies = {};
  });

  it("seeds state with detached copies of the build exports", () => {
    const store = accessUntheme();

    expect(store.config.value.theme).toEqual(theme);
    expect(store.config.value.theme).not.toBe(theme);
    expect(store.config.value.theme.tokens).not.toBe(theme.tokens);

    expect(store.config.value.input).toEqual(input);
    expect(store.config.value.input).not.toBe(input);
  });

  it("keeps writes into the seeded state away from the build module", () => {
    const store = accessUntheme();
    store.config.value.theme.tokens.primary.$value = "{indigo}";

    expect(theme.tokens.primary.$value).toBe("{blue}");
  });
});
