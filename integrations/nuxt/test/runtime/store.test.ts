import type { AppThemes } from "../../src/runtime/types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, reactive, type Ref } from "vue";
import { theme, themes, input } from "../fixtures";

let states: Record<string, Ref<unknown>>;
let cookies: Record<string, { value: unknown }>;

vi.mock("#build/untheme.mjs", () => ({ theme, themes, input }));

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

    expect(store.themes.value).toEqual(themes);
    expect(store.themes.value).not.toBe(themes);
    expect(store.themes.value.bravo).not.toBe(themes.bravo);
  });

  it("keeps writes into the seeded state away from the build module", () => {
    const store = accessUntheme();
    const registry: AppThemes = store.themes.value;
    registry.created = { id: "created", name: "Created", tokens: {} };

    expect("created" in themes).toBe(false);
    expect(theme.tokens.primary.$value).toBe("{blue}");
  });
});
