import { describe, it, expect, vi, beforeEach } from "vitest";
import { reactive, ref, nextTick, type Ref } from "vue";
import { defineUntheme, type Untheme } from "untheme";
import {
  appTheme,
  themesMap,
  createStoreRefs,
  type StoreRefs,
} from "../fixtures";

let store: StoreRefs;
let initialized: Ref<boolean>;
let untheme: Untheme<string, string, string>;

const client = { get: vi.fn(async (id: string) => ({ ...themesMap[id] })) };

vi.mock("../../src/runtime/store", () => ({
  accessTheme: () => ({
    initialized,
    key: store.key,
    themes: store.themes,
    cookies: {
      key: store.cookieKey,
      mode: store.cookieMode,
    },
  }),
}));

vi.mock("../../src/runtime/util", () => ({
  makeUntheme: () => () => untheme,
  makeThemeClient: () => () => client,
}));

import { useTheme } from "../../src/runtime/composable";

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStoreRefs();
    initialized = ref(false);
    untheme = reactive(
      defineUntheme({ ...appTheme }, "dark"),
    ) as unknown as Untheme<string, string, string>;
    client.get.mockImplementation(async (id: string) => ({
      ...themesMap[id],
    }));
  });

  it("returns mode, theme, themes, tokens, and init", () => {
    const result = useTheme();
    expect(result).toHaveProperty("mode");
    expect(result).toHaveProperty("theme");
    expect(result).toHaveProperty("themes");
    expect(result).toHaveProperty("tokens");
    expect(result).toHaveProperty("init");
  });

  it("exposes the initial mode as a ref", () => {
    const { mode } = useTheme();
    expect(mode.value).toBe("dark");
  });

  it("exposes the theme as a ref", () => {
    const { theme } = useTheme();
    expect(theme.value.label).toBe("Alpha");
  });

  it("exposes tokens as a ref", () => {
    const { tokens } = useTheme();
    expect(tokens.value).toHaveProperty("white");
    expect(tokens.value).toHaveProperty("primary");
  });

  describe("reactivity", () => {
    it("tokens ref updates when mode changes", async () => {
      const { mode, tokens } = useTheme();
      expect(tokens.value.primary).toBe("indigo");
      mode.value = "light";
      await nextTick();
      expect(tokens.value.primary).toBe("blue");
    });

    it("theme ref updates when theme is replaced", async () => {
      const { theme } = useTheme();
      expect(theme.value.label).toBe("Alpha");
      theme.value = { ...appTheme, label: "Replaced" };
      await nextTick();
      expect(theme.value.label).toBe("Replaced");
    });

    it("tokens ref reflects token updates", async () => {
      const { tokens } = useTheme();
      expect(tokens.value.white).toBe("#ffffff");
      untheme.update("white", "#fefefe");
      await nextTick();
      expect(tokens.value.white).toBe("#fefefe");
    });
  });

  describe("init", () => {
    it("syncs mode from cookie", async () => {
      store.cookieMode.value = "light";
      const { init, mode } = useTheme();
      await init();
      expect(mode.value).toBe("light");
    });

    it("does not change mode if cookie matches", async () => {
      store.cookieMode.value = "dark";
      const { init, mode } = useTheme();
      await init();
      expect(mode.value).toBe("dark");
    });

    it("switches theme via the client when cookie key differs", async () => {
      store.cookieKey.value = "bravo";
      const { init, theme } = useTheme();
      await init();
      expect(client.get).toHaveBeenCalledWith("bravo");
      expect(store.key.value).toBe("bravo");
      expect(theme.value.label).toBe("Bravo");
    });

    it("does not switch when cookie key matches", async () => {
      store.cookieKey.value = "alpha";
      const { init } = useTheme();
      await init();
      expect(client.get).not.toHaveBeenCalled();
      expect(store.key.value).toBe("alpha");
    });

    it("does nothing when already initialized", async () => {
      initialized.value = true;
      store.cookieMode.value = "light";
      const { init, mode } = useTheme();
      await init();
      expect(mode.value).toBe("dark");
    });
  });
});
