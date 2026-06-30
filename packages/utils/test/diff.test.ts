import { describe, it, expect } from "vitest";
import { diff } from "../src/diff";
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

describe("diff", () => {
  it("is all-empty for identical themes", () => {
    expect(diff(base, structuredClone(base))).toEqual({
      tokens: {},
      modifiers: { color: { light: {}, dark: {} } },
    });
  });

  it("holds only the deviating bindings, token and context wise", () => {
    const edited = merge(base, {
      tokens: { white: "#fafafa" },
      modifiers: { color: { dark: { background: "{blue}" } } },
    });
    expect(diff(base, edited)).toEqual({
      tokens: { white: "#fafafa" },
      modifiers: { color: { light: {}, dark: { background: "{blue}" } } },
    });
  });

  it("does not compare identity", () => {
    const renamed = merge(base, { id: "other", name: "Other" });
    expect(diff(base, renamed)).toEqual({
      tokens: {},
      modifiers: { color: { light: {}, dark: {} } },
    });
  });

  it("round-trips through merge", () => {
    const edited = merge(base, {
      tokens: { blue: "#0090ff" },
      modifiers: { color: { light: { foreground: "{blue}" } } },
    });
    expect(merge(base, diff(base, edited))).toEqual(edited);
  });
});
