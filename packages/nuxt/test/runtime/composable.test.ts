import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStoreRefs, appTheme, type StoreRefs } from "../fixtures";

let store: StoreRefs;

vi.mock("../../runtime/store", () => ({
  accessTheme: () => ({
    key: store.key,
    theme: store.theme,
    mode: store.mode,
    cookies: {
      key: store.cookieKey,
      mode: store.cookieMode,
    },
  }),
}));

const mockFetch = vi.fn();
vi.mock("#imports", () => ({
  useRequestFetch: () => mockFetch,
}));

vi.mock("#build/untheme.mjs", async () => {
  const f = await import("../fixtures");
  return { themes: f.themes, tokens: f.tokens };
});

vi.mock("#build/types/untheme.d.ts", () => ({}));

import { useTheme } from "../../runtime/composable";

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStoreRefs();
  });

  it("returns readonly key, theme, and mode", () => {
    const { key, theme, mode } = useTheme();
    expect(key.value).toBe("alpha");
    expect(theme.value.label).toBe("Alpha");
    expect(mode.value).toBe("dark");
  });

  it("returns themes and tokens from build", () => {
    const result = useTheme();
    expect(result.themes).toHaveLength(2);
    expect(result.tokens.reference).toContain("white");
  });

  describe("toggle", () => {
    it("toggles from dark to light", () => {
      const { toggle } = useTheme();
      toggle();
      expect(store.mode.value).toBe("light");
      expect(store.cookieMode.value).toBe("light");
    });

    it("toggles from light to dark", () => {
      store.mode.value = "light";
      const { toggle } = useTheme();
      toggle();
      expect(store.mode.value).toBe("dark");
      expect(store.cookieMode.value).toBe("dark");
    });
  });

  describe("set", () => {
    it("sets the active theme key and cookie", () => {
      const { set } = useTheme();
      set("bravo");
      expect(store.key.value).toBe("bravo");
      expect(store.cookieKey.value).toBe("bravo");
    });
  });

  describe("initialize", () => {
    it("syncs mode from cookie", async () => {
      store.cookieMode.value = "light";
      const { initialize } = useTheme();
      await initialize();
      expect(store.mode.value).toBe("light");
    });

    it("does not change mode if cookie matches", async () => {
      store.cookieMode.value = "dark";
      const { initialize } = useTheme();
      await initialize();
      expect(store.mode.value).toBe("dark");
    });

    it("fetches theme when cookie key differs", async () => {
      const fetched = { ...appTheme, label: "Bravo" };
      mockFetch.mockResolvedValueOnce(fetched);
      store.cookieKey.value = "bravo";
      const { initialize } = useTheme();
      await initialize();
      expect(store.key.value).toBe("bravo");
      expect(mockFetch).toHaveBeenCalledWith("/api/theme/bravo");
      expect(store.theme.value.label).toBe("Bravo");
    });

    it("does not fetch when cookie key matches", async () => {
      store.cookieKey.value = "alpha";
      const { initialize } = useTheme();
      await initialize();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns true", async () => {
      const { initialize } = useTheme();
      expect(await initialize()).toBe(true);
    });
  });

  describe("update", () => {
    it("merges partial reference overrides", () => {
      const { update } = useTheme();
      update({ reference: { white: "#fefefe" } });
      expect(store.theme.value.reference.white).toBe("#fefefe");
    });

    it("preserves existing values not overridden", () => {
      const { update } = useTheme();
      update({ reference: { white: "#fefefe" } });
      expect(store.theme.value.reference.black).toBe("#000000");
    });

    it("merges mode overrides", () => {
      const { update } = useTheme();
      update({ modes: { light: { primary: "indigo" } } });
      expect(store.theme.value.modes.light.primary).toBe("indigo");
    });

    it("merges role overrides", () => {
      const { update } = useTheme();
      update({ roles: { "text-color": "primary" } });
      expect(store.theme.value.roles["text-color"]).toBe("primary");
    });

    it("preserves label", () => {
      const { update } = useTheme();
      update({ reference: { white: "#111" } });
      expect(store.theme.value.label).toBe("Alpha");
    });
  });
});
