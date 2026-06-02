import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";
import type { ColorMode } from "untheme";

const mockMode = ref<ColorMode>("dark");
const mockTokens = ref<Record<string, string>>({ white: "#ffffff" });

vi.mock("../../runtime/composable", () => ({
  useTheme: () => ({
    mode: mockMode,
    tokens: computed(() => mockTokens.value),
  }),
}));

interface HeadInput {
  htmlAttrs: { class: { value: string } };
  style: { value: Array<{ key: string; innerHTML: string }> };
}

const headCalls: HeadInput[] = [];
vi.mock("#imports", () => ({
  useHead: (input: HeadInput) => {
    headCalls.push(input);
  },
}));

vi.mock("#app", () => ({
  defineNuxtPlugin: (def: {
    name: string;
    setup: (nuxtApp?: unknown) => void;
  }) => def,
}));

vi.mock("untheme", () => ({
  generateCSS: (tokens: Record<string, string>) =>
    `/* css ${Object.keys(tokens).join(",")} */`,
}));

import plugin from "../../runtime/plugin";

describe("untheme plugin", () => {
  beforeEach(() => {
    headCalls.length = 0;
    mockMode.value = "dark";
    mockTokens.value = { white: "#ffffff" };
  });

  it("has the name untheme", () => {
    expect(plugin.name).toBe("untheme");
  });

  it("calls useHead on setup", () => {
    plugin.setup();
    expect(headCalls.length).toBeGreaterThan(0);
  });

  it("sets dark class when mode is dark", () => {
    plugin.setup();
    expect(headCalls[0].htmlAttrs.class.value).toContain("dark");
  });

  it("removes dark class when mode is light", () => {
    mockMode.value = "light";
    plugin.setup();
    expect(headCalls[0].htmlAttrs.class.value).not.toContain("dark");
  });

  it("generates CSS from tokens", () => {
    plugin.setup();
    expect(headCalls[0].style.value[0].innerHTML).toContain("css white");
  });
});
