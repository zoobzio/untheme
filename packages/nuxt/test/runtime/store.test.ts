import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

const mocks = vi.hoisted(() => {
  const useStateImpl = (_: string, init: () => unknown) => ref(init());
  const useCookieImpl = (_key: string) => ref(null);
  return {
    useState: vi.fn(useStateImpl),
    useCookie: vi.fn(useCookieImpl),
  };
});

vi.mock("#imports", () => mocks);

vi.mock("#build/untheme.mjs", async () => {
  const { appTheme } = await import("../fixtures");
  return {
    theme: appTheme,
    options: [
      { key: "alpha", label: "Alpha" },
      { key: "bravo", label: "Bravo" },
    ],
  };
});

vi.mock("#build/types/untheme.d.ts", () => ({}));

import { accessTheme } from "../../src/runtime/store";

describe("accessTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useState.mockImplementation((_, init: () => unknown) => ref(init()));
    mocks.useCookie.mockImplementation(() => ref(null));
  });

  it("returns initialized, key, theme, themes, mode, and cookies", () => {
    const result = accessTheme();
    expect(result).toHaveProperty("initialized");
    expect(result).toHaveProperty("key");
    expect(result).toHaveProperty("theme");
    expect(result).toHaveProperty("themes");
    expect(result).toHaveProperty("mode");
    expect(result).toHaveProperty("cookies");
  });

  it("starts uninitialized", () => {
    const { initialized } = accessTheme();
    expect(initialized.value).toBe(false);
  });

  it("initializes key to the default 'system'", () => {
    const { key } = accessTheme();
    expect(key.value).toBe("system");
  });

  it("initializes theme from build-time value", () => {
    const { theme } = accessTheme();
    expect(theme.value.label).toBe("Alpha");
  });

  it("exposes the bundled theme options", () => {
    const { themes } = accessTheme();
    expect(themes.value).toEqual([
      { key: "alpha", label: "Alpha" },
      { key: "bravo", label: "Bravo" },
    ]);
  });

  it("initializes mode as dark", () => {
    const { mode } = accessTheme();
    expect(mode.value).toBe("dark");
  });

  it("creates cookies for key and mode", () => {
    accessTheme();
    const cookieKeys = mocks.useCookie.mock.calls.map((c) => c[0]);
    expect(cookieKeys).toContain("untheme-key");
    expect(cookieKeys).toContain("untheme-mode");
  });

  it("calls useState with correct keys", () => {
    accessTheme();
    const stateKeys = mocks.useState.mock.calls.map((c) => c[0]);
    expect(stateKeys).toContain("untheme:initialized");
    expect(stateKeys).toContain("untheme:key");
    expect(stateKeys).toContain("untheme:theme");
    expect(stateKeys).toContain("untheme:mode");
    expect(stateKeys).toContain("untheme:themes");
  });
});
