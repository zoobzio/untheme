import { describe, it, expect } from "vitest";
import { defineUntheme } from "../src/service";
import type { Theme } from "../src/types";

const theme = {
  label: "test",
  reference: {
    white: "#ffffff",
    black: "#000000",
    blue: "#0000ff",
  },
  modes: {
    light: {
      background: "white",
      foreground: "black",
    },
    dark: {
      background: "black",
      foreground: "white",
    },
  },
  roles: {
    primary: "foreground",
  },
} satisfies Theme<string, string, string>;

describe("defineUntheme", () => {
  describe("theme", () => {
    it("exposes the theme via getter", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.theme).toBe(theme);
    });

    it("allows replacing the theme via setter", () => {
      const ut = defineUntheme(structuredClone(theme), "dark");
      const next = structuredClone(theme);
      next.label = "replaced";
      ut.theme = next;
      expect(ut.theme.label).toBe("replaced");
    });
  });

  describe("mode", () => {
    it("exposes the initial color mode", () => {
      expect(defineUntheme(theme, "dark").mode).toBe("dark");
      expect(defineUntheme(theme, "light").mode).toBe("light");
    });

    it("allows setting the mode via setter", () => {
      const ut = defineUntheme(theme, "dark");
      ut.mode = "light";
      expect(ut.mode).toBe("light");
    });

    it("reactively updates tokens when mode changes", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.tokens.background).toBe("black");
      ut.mode = "light";
      expect(ut.tokens.background).toBe("white");
    });
  });

  describe("tokens", () => {
    it("merges reference, mode, and role tokens", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.tokens.white).toBe("#ffffff");
      expect(ut.tokens.background).toBe("black");
      expect(ut.tokens.primary).toBe("foreground");
    });

    it("uses the active color mode for system tokens", () => {
      const ut = defineUntheme(theme, "light");
      expect(ut.tokens.background).toBe("white");
      expect(ut.tokens.foreground).toBe("black");
    });
  });

  describe("resolve", () => {
    it("resolves a reference token to its raw value", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.resolve("white")).toBe("#ffffff");
    });

    it("resolves a system token through to the raw value", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.resolve("background")).toBe("#000000");
    });

    it("resolves a role token through the full chain", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.resolve("primary")).toBe("#ffffff");
    });
  });

  describe("update", () => {
    it("updates a reference token value", () => {
      const ut = defineUntheme(structuredClone(theme), "dark");
      ut.update("white", "#fefefe");
      expect(ut.tokens.white).toBe("#fefefe");
    });

    it("updates a system token value", () => {
      const ut = defineUntheme(structuredClone(theme), "dark");
      ut.update("background", "blue");
      expect(ut.tokens.background).toBe("blue");
    });

    it("updates a role token value", () => {
      const ut = defineUntheme(structuredClone(theme), "dark");
      ut.update("primary", "background");
      expect(ut.tokens.primary).toBe("background");
    });

    it("ignores an unknown token (no matching tier)", () => {
      const ut = defineUntheme(structuredClone(theme), "dark");
      const before = { ...ut.tokens };
      // @ts-expect-error - exercising the runtime no-op for an unknown token
      ut.update("nonsense", "white");
      expect(ut.tokens).toEqual(before);
    });

    it("ignores a system token assigned a non-reference value", () => {
      const ut = defineUntheme(structuredClone(theme), "dark");
      // "primary" is a role name, not a reference — guard requires isRef(value)
      // @ts-expect-error - exercising the runtime no-op for an invalid value tier
      ut.update("background", "primary");
      expect(ut.tokens.background).toBe("black");
    });

    it("ignores a role token assigned a non-token value", () => {
      const ut = defineUntheme(structuredClone(theme), "dark");
      // @ts-expect-error - exercising the runtime no-op for an invalid value tier
      ut.update("primary", "nonsense");
      expect(ut.tokens.primary).toBe("foreground");
    });
  });

  describe("tokens precedence", () => {
    // Names deliberately collide across tiers to pin the spread order:
    // reference < mode < role (last write wins).
    const collide = {
      preset: "collide",
      key: "collide",
      label: "collide",
      reference: { a: "ref-a", b: "ref-b" },
      modes: {
        light: { a: "mode-a", b: "mode-b" },
        dark: { a: "mode-a", b: "mode-b" },
      },
      roles: { b: "role-b" },
    } satisfies Theme<string, string, string>;

    it("mode tokens override reference tokens on key collision", () => {
      const ut = defineUntheme(collide, "dark");
      expect(ut.tokens.a).toBe("mode-a");
    });

    it("role tokens override mode and reference tokens on key collision", () => {
      const ut = defineUntheme(collide, "dark");
      expect(ut.tokens.b).toBe("role-b");
    });
  });

  describe("isRef", () => {
    it("returns true for reference token names", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isRef("white")).toBe(true);
      expect(ut.isRef("black")).toBe(true);
      expect(ut.isRef("blue")).toBe(true);
    });

    it("returns false for non-reference tokens", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isRef("background")).toBe(false);
      expect(ut.isRef("primary")).toBe(false);
      expect(ut.isRef("unknown")).toBe(false);
    });
  });

  describe("isSys", () => {
    it("returns true for system token names", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isSys("background")).toBe(true);
      expect(ut.isSys("foreground")).toBe(true);
    });

    it("returns false for non-system tokens", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isSys("white")).toBe(false);
      expect(ut.isSys("primary")).toBe(false);
    });
  });

  describe("isRole", () => {
    it("returns true for role token names", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isRole("primary")).toBe(true);
    });

    it("returns false for non-role tokens", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isRole("white")).toBe(false);
      expect(ut.isRole("background")).toBe(false);
    });
  });

  describe("isToken", () => {
    it("returns true for any token name", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isToken("white")).toBe(true);
      expect(ut.isToken("background")).toBe(true);
      expect(ut.isToken("primary")).toBe(true);
    });

    it("returns false for unknown values", () => {
      const ut = defineUntheme(theme, "dark");
      expect(ut.isToken("unknown")).toBe(false);
      expect(ut.isToken("#ffffff")).toBe(false);
    });
  });
});
