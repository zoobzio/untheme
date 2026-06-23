import { describe, it, expect } from "vitest";
import { diff } from "../src/diff";
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

describe("diff", () => {
  it("is all-empty for identical themes", () => {
    expect(diff(base, structuredClone(base))).toEqual({
      reference: {},
      system: { light: {}, dark: {} },
      roles: {},
    });
  });

  it("holds only the deviating bindings, facet by facet", () => {
    const edited = merge(base, {
      reference: { white: "#fafafa" },
      system: { dark: { background: "blue" } },
      roles: { primary: "background" },
    });
    expect(diff(base, edited)).toEqual({
      reference: { white: "#fafafa" },
      system: { light: {}, dark: { background: "blue" } },
      roles: { primary: "background" },
    });
  });

  it("does not compare identity", () => {
    const renamed = merge(base, { id: "other", name: "Other" });
    expect(diff(base, renamed)).toEqual({
      reference: {},
      system: { light: {}, dark: {} },
      roles: {},
    });
  });

  it("round-trips through merge", () => {
    const edited = merge(base, {
      reference: { blue: "#0090ff" },
      system: { light: { foreground: "blue" } },
    });
    expect(merge(base, diff(base, edited))).toEqual(edited);
  });
});
