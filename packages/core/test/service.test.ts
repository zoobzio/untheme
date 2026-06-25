import { describe, it, expect } from "vitest";
import { defineUntheme } from "../src/service";
import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownThemeError,
} from "../src/error";
import { SchemaError } from "@untheme/schema";

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

/**
 * A fresh service over an isolated copy of the base theme.
 */
const make = (mode: "light" | "dark" = "dark") =>
  defineUntheme({ mode, theme: structuredClone(base) });

describe("defineUntheme", () => {
  describe("validation", () => {
    it("throws SchemaError when the theme breaks its own contract", () => {
      const broken = structuredClone(base);
      broken.reference.white = "red;} body{background:red}";
      expect(() => defineUntheme({ mode: "dark", theme: broken })).toThrow(
        SchemaError,
      );
      expect(() => defineUntheme({ mode: "dark", theme: broken })).toThrow(
        "reference.white",
      );
    });

    it("throws SchemaError when the modes are unbalanced", () => {
      const broken = structuredClone(base);
      Reflect.deleteProperty(broken.system.dark, "foreground");
      expect(() => defineUntheme({ mode: "dark", theme: broken })).toThrow(
        SchemaError,
      );
    });

    it("throws SchemaError when a role aliases itself", () => {
      const broken = structuredClone(base);
      broken.roles.primary = "primary";
      expect(() => defineUntheme({ mode: "dark", theme: broken })).toThrow(
        SchemaError,
      );
    });
  });

  describe("semantic errors", () => {
    it("constructor throws InvalidThemeError for a broken base", () => {
      const broken = structuredClone(base);
      broken.roles.primary = "primary";
      expect(() => defineUntheme({ mode: "dark", theme: broken })).toThrow(
        InvalidThemeError,
      );
    });

    it("constructor throws InvalidLayerError for a broken registry layer", () => {
      expect(() =>
        defineUntheme(
          { mode: "dark", theme: structuredClone(base) },
          {
            bad: {
              id: "bad",
              name: "Bad",
              reference: {},
              system: { light: { background: "ghost" }, dark: {} },
              roles: {},
            },
          },
        ),
      ).toThrow(InvalidLayerError);
    });

    it("update throws InvalidPatchError", () => {
      const ut = make();
      expect(() => ut.update({ reference: { ghost: "#000000" } })).toThrow(
        InvalidPatchError,
      );
    });

    it("apply throws InvalidLayerError", () => {
      const ut = make();
      expect(() =>
        ut.apply({
          id: "bad",
          name: "Bad",
          reference: {},
          system: { light: { background: "ghost" }, dark: {} },
          roles: {},
        }),
      ).toThrow(InvalidLayerError);
    });

    it("create throws InvalidLayerError", () => {
      const ut = make();
      expect(() =>
        ut.create({
          id: "bad",
          name: "Bad",
          reference: {},
          system: { light: {}, dark: {} },
          roles: { primary: "primary" },
        }),
      ).toThrow(InvalidLayerError);
    });

    it("remains a SchemaError carrying the underlying issues", () => {
      const ut = make();
      let caught: unknown;
      try {
        ut.update({ reference: { ghost: "#000000" } });
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(SchemaError);
      expect(caught).toBeInstanceOf(InvalidPatchError);
      if (caught instanceof InvalidPatchError) {
        expect(caught.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("config", () => {
    it("exposes the caller-owned container", () => {
      const ut = make();
      expect(ut.config.mode).toBe("dark");
      expect(ut.config.theme.id).toBe("test");
    });

    it("reads flow through the container, not a snapshot", () => {
      const ut = make();
      ut.config.mode = "light";
      expect(ut.resolve("background")).toBe("#ffffff");

      ut.config.theme = {
        ...structuredClone(base),
        reference: { ...base.reference, white: "#fafafa" },
      };
      expect(ut.resolve("background")).toBe("#fafafa");
    });
  });

  describe("themes", () => {
    it("exposes the given theme registry", () => {
      const night = {
        id: "night",
        name: "Night",
        reference: {},
        system: { light: {}, dark: { background: "blue" } },
        roles: {},
      };
      const ut = defineUntheme(
        { mode: "dark", theme: structuredClone(base) },
        { night },
      );
      expect(ut.themes.night).toBe(night);
    });

    it("defaults to an empty registry", () => {
      const ut = make();
      expect(ut.themes).toEqual({});
    });

    it("validates registry layers up front", () => {
      expect(() =>
        defineUntheme(
          { mode: "dark", theme: structuredClone(base) },
          {
            bad: {
              id: "bad",
              name: "Bad",
              reference: {},
              system: { light: { background: "ghost" }, dark: {} },
              roles: {},
            },
          },
        ),
      ).toThrow(SchemaError);
    });
  });

  describe("schema", () => {
    it("exposes guards bound to the theme contract", () => {
      const ut = make();
      expect(ut.schema.guard.reference("white")).toBe(true);
      expect(ut.schema.guard.role("primary")).toBe(true);
      expect(ut.schema.guard.token("ghost")).toBe(false);
    });
  });

  describe("tokens", () => {
    it("merges reference, the given mode's system bindings, and roles", () => {
      const ut = make();
      expect(ut.tokens("dark")).toEqual({
        white: "#ffffff",
        black: "#000000",
        blue: "#0000ff",
        background: "black",
        foreground: "white",
        primary: "foreground",
      });
    });

    it("reads any mode without touching the active one", () => {
      const ut = make();
      expect(ut.tokens("light").background).toBe("white");
      expect(ut.config.mode).toBe("dark");
    });

    it("defaults to the active mode", () => {
      const ut = make();
      expect(ut.tokens()).toEqual(ut.tokens("dark"));
      ut.config.mode = "light";
      expect(ut.tokens().background).toBe("white");
    });
  });

  describe("get", () => {
    it("returns the current binding without resolving", () => {
      const ut = make();
      expect(ut.get("primary")).toBe("foreground");
      expect(ut.get("background")).toBe("black");
      expect(ut.get("white")).toBe("#ffffff");
    });
  });

  describe("resolve", () => {
    it("follows the alias chain to a raw value", () => {
      const ut = make();
      // primary -> foreground -> white -> #ffffff
      expect(ut.resolve("primary")).toBe("#ffffff");
      expect(ut.resolve("background")).toBe("#000000");
      expect(ut.resolve("white")).toBe("#ffffff");
    });

    it("resolves through the active mode", () => {
      const ut = make("light");
      expect(ut.resolve("primary")).toBe("#000000");
    });

    it("throws CircularAliasError on a circular alias chain", () => {
      const ut = make();
      // reference values equal to token names are followed as aliases; the
      // loop is caught via the visited-token chain, not a stack overflow
      ut.set("white", "black");
      ut.set("black", "white");
      expect(() => ut.resolve("white")).toThrow(CircularAliasError);
    });

    it("reports the looping chain", () => {
      const ut = make();
      ut.set("white", "black");
      ut.set("black", "white");
      let caught: unknown;
      try {
        ut.resolve("white");
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(CircularAliasError);
      if (caught instanceof CircularAliasError) {
        expect(caught.chain).toContain("white");
        expect(caught.chain).toContain("black");
      }
    });
  });

  describe("set", () => {
    it("points a role at another alias", () => {
      const ut = make();
      ut.set("primary", "background");
      expect(ut.get("primary")).toBe("background");
      expect(ut.resolve("primary")).toBe("#000000");
    });

    it("rebinds a system token in the active mode only", () => {
      const ut = make();
      ut.set("background", "blue");
      expect(ut.tokens("dark").background).toBe("blue");
      expect(ut.tokens("light").background).toBe("white");
    });

    it("sets a reference value", () => {
      const ut = make();
      ut.set("white", "#fafafa");
      expect(ut.resolve("white")).toBe("#fafafa");
    });

    it("ignores writes that break tier rules", () => {
      const ut = make();
      ut.set("primary", "ghost");
      ut.set("background", "#123456");
      ut.set("white", "red;} body{background:red}");
      expect(ut.get("primary")).toBe("foreground");
      expect(ut.get("background")).toBe("black");
      expect(ut.get("white")).toBe("#ffffff");
    });
  });

  describe("update", () => {
    it("merges patch bindings and preserves identity", () => {
      const ut = make();
      ut.update({ reference: { white: "#f0f0f0" } });
      expect(ut.config.theme.id).toBe("test");
      expect(ut.resolve("white")).toBe("#f0f0f0");
      expect(ut.resolve("black")).toBe("#000000");
    });

    it("patches a single mode without touching the other", () => {
      const ut = make();
      ut.update({ system: { dark: { background: "blue" } } });
      expect(ut.tokens("dark").background).toBe("blue");
      expect(ut.tokens("light").background).toBe("white");
    });

    it("leaves the theme intact for an empty patch", () => {
      const ut = make();
      const before = structuredClone(ut.config.theme);
      ut.update({});
      expect(ut.config.theme).toEqual(before);
    });

    it("throws SchemaError and leaves the theme intact", () => {
      const ut = make();
      const before = structuredClone(ut.config.theme);
      expect(() => ut.update({ reference: { ghost: "#000000" } })).toThrow(
        SchemaError,
      );
      expect(() =>
        ut.update({ reference: { white: "red;} body{background:red}" } }),
      ).toThrow(SchemaError);
      expect(ut.config.theme).toEqual(before);
    });
  });

  describe("apply", () => {
    it("adopts the layer's identity and merges its bindings", () => {
      const ut = make();
      ut.apply({
        id: "other",
        name: "Other",
        reference: { blue: "#0090ff" },
        system: { light: {}, dark: { foreground: "blue" } },
        roles: {},
      });
      expect(ut.config.theme.id).toBe("other");
      expect(ut.config.theme.name).toBe("Other");
      // merged: untouched tokens survive, overridden ones change
      expect(ut.resolve("white")).toBe("#ffffff");
      expect(ut.resolve("primary")).toBe("#0090ff");
    });

    it("throws SchemaError and leaves the theme intact", () => {
      const ut = make();
      const before = structuredClone(ut.config.theme);
      expect(() =>
        ut.apply({
          id: "bad",
          name: "Bad",
          reference: {},
          system: { light: { background: "ghost" }, dark: {} },
          roles: {},
        }),
      ).toThrow(SchemaError);
      expect(ut.config.theme).toEqual(before);
    });

    it("re-baselines: the applied theme is the new reference point", () => {
      const ut = make();
      ut.apply({
        id: "other",
        name: "Other",
        reference: { blue: "#0090ff" },
        system: { light: {}, dark: {} },
        roles: {},
      });
      expect(ut.dirty()).toBe(false);
      ut.set("white", "#fafafa");
      ut.reset();
      // reset returns to the applied theme, not the original
      expect(ut.config.theme.id).toBe("other");
      expect(ut.resolve("blue")).toBe("#0090ff");
      expect(ut.resolve("white")).toBe("#ffffff");
    });
  });

  describe("select", () => {
    const seeded = () =>
      defineUntheme(
        { mode: "dark", theme: structuredClone(base) },
        {
          night: {
            id: "night",
            name: "Night",
            reference: { blue: "#0090ff" },
            system: { light: {}, dark: { foreground: "blue" } },
            roles: {},
          },
        },
      );

    it("switches to a registered layer by key", () => {
      const ut = seeded();
      ut.select("night");
      expect(ut.config.theme.id).toBe("night");
      expect(ut.resolve("primary")).toBe("#0090ff");
    });

    it("re-baselines the selected theme, like apply", () => {
      const ut = seeded();
      ut.select("night");
      expect(ut.dirty()).toBe(false);
    });

    it("throws UnknownThemeError for an unregistered key", () => {
      const ut = seeded();
      expect(() => ut.select("ghost")).toThrow(UnknownThemeError);
    });
  });

  describe("create", () => {
    it("resolves a layer against the baseline into a complete theme", () => {
      const ut = make();
      const theme = ut.create({
        id: "night",
        name: "Night",
        reference: { blue: "#0090ff" },
        system: { light: {}, dark: { foreground: "blue" } },
        roles: {},
      });
      expect(theme).toEqual({
        id: "night",
        name: "Night",
        reference: { white: "#ffffff", black: "#000000", blue: "#0090ff" },
        system: {
          light: { background: "white", foreground: "black" },
          dark: { background: "black", foreground: "blue" },
        },
        roles: { primary: "foreground" },
      });
    });

    it("backfills from the baseline, not the edited active theme", () => {
      const ut = make();
      ut.set("white", "#fafafa");
      const theme = ut.create({
        id: "night",
        name: "Night",
        reference: {},
        system: { light: {}, dark: {} },
        roles: {},
      });
      expect(theme.reference.white).toBe("#ffffff");
    });

    it("leaves the active theme untouched", () => {
      const ut = make();
      ut.create({
        id: "night",
        name: "Night",
        reference: { blue: "#0090ff" },
        system: { light: {}, dark: {} },
        roles: {},
      });
      expect(ut.config.theme.id).toBe("test");
      expect(ut.resolve("blue")).toBe("#0000ff");
    });

    it("registers the result so select can switch to it", () => {
      const ut = make();
      ut.create({
        id: "night",
        name: "Night",
        reference: { blue: "#0090ff" },
        system: { light: {}, dark: {} },
        roles: {},
      });
      expect(ut.themes.night).toBeDefined();
      ut.select("night");
      expect(ut.config.theme.id).toBe("night");
      expect(ut.resolve("blue")).toBe("#0090ff");
    });

    it("throws SchemaError for a layer outside the contract", () => {
      const ut = make();
      expect(() =>
        ut.create({
          id: "bad",
          name: "Bad",
          reference: {},
          system: { light: {}, dark: {} },
          roles: { primary: "primary" },
        }),
      ).toThrow(SchemaError);
    });
  });

  describe("extract", () => {
    it("snapshots the active theme under a new identity", () => {
      const ut = make();
      ut.set("white", "#fafafa");
      const theme = ut.extract("snap", "Snapshot");
      expect(theme.id).toBe("snap");
      expect(theme.name).toBe("Snapshot");
      expect(theme.reference.white).toBe("#fafafa");
    });

    it("returns a detached copy", () => {
      const ut = make();
      const theme = ut.extract("snap", "Snapshot");
      theme.reference.white = "#111111";
      expect(ut.resolve("white")).toBe("#ffffff");
    });

    it("does not register the snapshot", () => {
      const ut = make();
      ut.extract("snap", "Snapshot");
      expect(ut.themes.snap).toBeUndefined();
    });
  });

  describe("remove", () => {
    it("drops a theme from the registry", () => {
      const ut = make();
      ut.create({
        id: "night",
        name: "Night",
        reference: {},
        system: { light: {}, dark: {} },
        roles: {},
      });
      ut.remove("night");
      expect(ut.themes.night).toBeUndefined();
      expect(() => ut.select("night")).toThrow(UnknownThemeError);
    });

    it("is a no-op for an unknown id", () => {
      const ut = make();
      expect(() => ut.remove("ghost")).not.toThrow();
    });

    it("leaves the active theme standing when its entry is removed", () => {
      const ut = make();
      ut.create({
        id: "night",
        name: "Night",
        reference: {},
        system: { light: {}, dark: {} },
        roles: {},
      });
      ut.select("night");
      ut.remove("night");
      expect(ut.config.theme.id).toBe("night");
    });
  });

  describe("dirty", () => {
    it("is false for an untouched service", () => {
      const ut = make();
      expect(ut.dirty()).toBe(false);
    });

    it("is true after any binding deviates", () => {
      const ut = make();
      ut.set("white", "#fafafa");
      expect(ut.dirty()).toBe(true);
    });

    it("tracks patches across every facet", () => {
      const ut = make();
      ut.update({ system: { light: { background: "blue" } } });
      expect(ut.dirty()).toBe(true);
    });

    it("is false again once bindings return to the baseline", () => {
      const ut = make();
      ut.set("white", "#fafafa");
      ut.set("white", "#ffffff");
      expect(ut.dirty()).toBe(false);
    });

    it("falls back to the creation baseline for an uncached theme id", () => {
      const ut = make();
      ut.config.theme = ut.create({
        id: "night",
        name: "Night",
        reference: { blue: "#0090ff" },
        system: { light: {}, dark: {} },
        roles: {},
      });
      expect(ut.dirty()).toBe(true);
    });
  });

  describe("reset", () => {
    it("restores the baseline and clears dirt", () => {
      const ut = make();
      ut.set("white", "#fafafa");
      ut.update({ roles: { primary: "background" } });
      ut.reset();
      expect(ut.dirty()).toBe(false);
      expect(ut.resolve("white")).toBe("#ffffff");
      expect(ut.get("primary")).toBe("foreground");
    });

    it("restores through the container, so a swapped theme is replaced", () => {
      const ut = make();
      const before = structuredClone(ut.config.theme);
      ut.config.theme = ut.create({
        id: "night",
        name: "Night",
        reference: { blue: "#0090ff" },
        system: { light: {}, dark: {} },
        roles: {},
      });
      ut.reset();
      expect(ut.config.theme).toEqual(before);
    });
  });
});
