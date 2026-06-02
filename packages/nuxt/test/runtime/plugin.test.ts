import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import type { ThemeMode, ThemeTemplate } from "untheme";
import type { AppTheme } from "../../runtime/types";
import { appTheme } from "../fixtures";

const mockMode = ref<ThemeMode>("dark");
const mockTheme = ref<AppTheme>({ ...appTheme });

vi.mock("../../runtime/composable", () => ({
  useTheme: () => ({
    mode: mockMode,
    theme: mockTheme,
  }),
}));

interface HeadInput {
  htmlAttrs: { class: { value: string } };
  style: { value: Array<{ key: string; innerHTML: string }> };
}

const headCalls: HeadInput[] = [];
vi.mock("#imports", () => ({
  useHead: (input: HeadInput) => { headCalls.push(input); },
}));

vi.mock("#app", () => ({
  defineNuxtPlugin: (def: { name: string; setup: (nuxtApp?: unknown) => void }) => def,
}));

vi.mock("untheme", () => ({
  generateCSS: (theme: ThemeTemplate) => `/* css for ${theme.label} */`,
}));

import plugin from "../../runtime/plugin";

describe("untheme plugin", () => {
  beforeEach(() => {
    headCalls.length = 0;
    mockMode.value = "dark";
    mockTheme.value = { ...appTheme };
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

  it("generates CSS from the theme", () => {
    plugin.setup();
    expect(headCalls[0].style.value[0].innerHTML).toContain("css for Alpha");
  });
});
