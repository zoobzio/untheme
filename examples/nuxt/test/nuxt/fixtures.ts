import { mockModules, mockTheme } from "@untheme/testing";

/**
 * A stand-in for the aurora build that the module makes at build time. It
 * has two axes with a few contexts each, over a few tokens. That is enough
 * to drive the composables, and a test does not wait for it.
 */
export const theme = mockTheme({
  id: "fixture",
  name: "Fixture",
  tokens: {
    white: "#fff",
    black: "#000",
    surface: "{white}",
    "on-surface": "{black}",
    gap: "8px",
  },
  modifiers: {
    color: {
      light: {},
      dark: { surface: "{black}", "on-surface": "{white}" },
    },
    density: {
      default: {},
      compact: { gap: "4px" },
      cozy: { gap: "6px" },
    },
  },
});

/**
 * The modules that `#build/untheme/*` would hold for the fixture. The
 * `manifest` module stands in for the generated module, with the prose that
 * the demo renders.
 */
export const modules = mockModules(theme, {
  prose: {
    color: {
      name: "Color scheme",
      contexts: { dark: { name: "Dark", description: "Lights off." } },
    },
  },
});
