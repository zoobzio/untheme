import { describe, it, expect } from "vitest";
import { merge } from "../src/merge";

const base = {
  id: "test",
  name: "Test",
  reference: {
    white: "#ffffff",
    black: "#000000",
    blue: "#0000ff",
  },
  system: {
    light: { background: "white", foreground: "black" },
    dark: { background: "black", foreground: "white" },
  },
  roles: { primary: "foreground" },
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
    const theme = merge(base, { reference: { white: "#fafafa" } });
    expect(theme.id).toBe("test");
    expect(theme.name).toBe("Test");
  });

  it("merges overlay bindings over the theme, facet by facet", () => {
    const theme = merge(base, {
      reference: { blue: "#0090ff" },
      system: { dark: { foreground: "blue" } },
      roles: { primary: "background" },
    });
    expect(theme.reference).toEqual({
      white: "#ffffff",
      black: "#000000",
      blue: "#0090ff",
    });
    expect(theme.system.light).toEqual(base.system.light);
    expect(theme.system.dark).toEqual({
      background: "black",
      foreground: "blue",
    });
    expect(theme.roles).toEqual({ primary: "background" });
  });

  it("merges a single mode without touching the other", () => {
    const theme = merge(base, { system: { light: { background: "blue" } } });
    expect(theme.system.light.background).toBe("blue");
    expect(theme.system.dark).toEqual(base.system.dark);
  });

  it("applies overlays left to right: the last binding wins", () => {
    const theme = merge(
      base,
      { reference: { white: "#fafafa", blue: "#0090ff" } },
      { reference: { white: "#f0f0f0" } },
    );
    expect(theme.reference.white).toBe("#f0f0f0");
    expect(theme.reference.blue).toBe("#0090ff");
  });

  it("takes identity from the last overlay that carries one", () => {
    const theme = merge(
      base,
      { id: "first", name: "First" },
      { reference: { white: "#fafafa" } },
      { id: "last", name: "Last" },
    );
    expect(theme.id).toBe("last");
    expect(theme.name).toBe("Last");
  });

  it("keeps an adopted identity through identity-less overlays", () => {
    const theme = merge(
      base,
      { id: "other", name: "Other" },
      { roles: { primary: "background" } },
    );
    expect(theme.id).toBe("other");
    expect(theme.roles.primary).toBe("background");
  });

  it("mutates neither input", () => {
    const overlay = { reference: { white: "#fafafa" } };
    const theme = merge(base, overlay);
    expect(theme).not.toBe(base);
    expect(base.reference.white).toBe("#ffffff");
    expect(overlay).toEqual({ reference: { white: "#fafafa" } });
  });

  it("returns detached records", () => {
    const theme = merge(base, {});
    theme.reference.white = "#111111";
    theme.system.light.background = "blue";
    expect(base.reference.white).toBe("#ffffff");
    expect(base.system.light.background).toBe("white");
  });
});
