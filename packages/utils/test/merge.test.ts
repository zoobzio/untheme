import { describe, it, expect } from "vitest";
import { merge } from "../src/merge";

const base = {
  id: "test",
  name: "Test",
  tokens: {
    white: "#ffffff",
    black: "#000000",
    blue: "#0000ff",
    background: "{white}",
    foreground: "{black}",
  },
  modifiers: {
    color: {
      light: { background: "{white}", foreground: "{black}" },
      dark: { background: "{black}", foreground: "{white}" },
    },
  },
  order: ["color"],
};

describe("merge", () => {
  it("returns a detached clone for no overlays", () => {
    const theme = merge(base);
    expect(theme).toEqual(base);
    expect(theme).not.toBe(base);
  });

  it("returns the theme unchanged for an empty overlay", () => {
    expect(merge(base, {})).toEqual(base);
  });

  it("adopts the overlay's identity when it carries one", () => {
    const theme = merge(base, { id: "other", name: "Other" });
    expect(theme.id).toBe("other");
    expect(theme.name).toBe("Other");
  });

  it("preserves the theme's identity when the overlay has none", () => {
    const theme = merge(base, { tokens: { white: "#fafafa" } });
    expect(theme.id).toBe("test");
    expect(theme.name).toBe("Test");
  });

  it("merges overlay bindings token by token and context by context", () => {
    const theme = merge(base, {
      tokens: { blue: "#0090ff" },
      modifiers: { color: { dark: { foreground: "{blue}" } } },
    });
    expect(theme.tokens.blue).toBe("#0090ff");
    expect(theme.tokens.white).toBe("#ffffff");
    expect(theme.modifiers.color.light).toEqual(base.modifiers.color.light);
    expect(theme.modifiers.color.dark).toEqual({
      background: "{black}",
      foreground: "{blue}",
    });
  });

  it("merges a single context without touching the other", () => {
    const theme = merge(base, {
      modifiers: { color: { light: { background: "{blue}" } } },
    });
    expect(theme.modifiers.color.light.background).toBe("{blue}");
    expect(theme.modifiers.color.dark).toEqual(base.modifiers.color.dark);
  });

  it("applies overlays left to right: the last binding wins", () => {
    const theme = merge(
      base,
      { tokens: { white: "#fafafa", blue: "#0090ff" } },
      { tokens: { white: "#f0f0f0" } },
    );
    expect(theme.tokens.white).toBe("#f0f0f0");
    expect(theme.tokens.blue).toBe("#0090ff");
  });

  it("takes identity from the last overlay that carries one", () => {
    const theme = merge(
      base,
      { id: "first", name: "First" },
      { tokens: { white: "#fafafa" } },
      { id: "last", name: "Last" },
    );
    expect(theme.id).toBe("last");
    expect(theme.name).toBe("Last");
  });

  it("mutates neither input", () => {
    const overlay = { tokens: { white: "#fafafa" } };
    const theme = merge(base, overlay);
    expect(theme).not.toBe(base);
    expect(base.tokens.white).toBe("#ffffff");
    expect(overlay).toEqual({ tokens: { white: "#fafafa" } });
  });

  it("returns detached records", () => {
    const theme = merge(base, {});
    theme.tokens.white = "#111111";
    theme.modifiers.color.light.background = "{blue}";
    expect(base.tokens.white).toBe("#ffffff");
    expect(base.modifiers.color.light.background).toBe("{white}");
  });
});
