import { describe, it, expect } from "vitest";
import { clone } from "../src/clone";

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

describe("clone", () => {
  it("copies every facet structurally", () => {
    const copy = clone(base);
    expect(copy).toEqual(base);
    expect(copy).not.toBe(base);
  });

  it("detaches every record from the original", () => {
    const copy = clone(base);
    copy.reference.white = "#fafafa";
    copy.system.light.background = "blue";
    copy.system.dark.foreground = "blue";
    copy.roles.primary = "background";
    expect(base.reference.white).toBe("#ffffff");
    expect(base.system.light.background).toBe("white");
    expect(base.system.dark.foreground).toBe("white");
    expect(base.roles.primary).toBe("foreground");
  });
});
