import type { Contract, Input, Layer, Overrides } from "@untheme/schema";
import type { Mod, Tok } from "./fixture";

import { describe, it, expect } from "vitest";

import { makeUntheme } from "../src/factory";
import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownModifierError,
} from "../src/error";
import { black, blue, theme, white } from "./fixture";

type T = Contract<Tok, Mod>;

const makeConfig = (): {
  layer?: Layer<T>;
  input: Input<T>;
  override: Overrides<T>;
} => ({
  input: { mode: "light", contrast: "normal" },
  override: {},
});

/** Makes a service over a detached copy of the fixture theme. */
const boot = (
  config = makeConfig(),
  options: Parameters<typeof makeUntheme<T>>[2] = {},
) => makeUntheme<T>(structuredClone(theme), config, options);

describe("construction", () => {
  it("builds over a valid theme and selection", () => {
    expect(() => boot()).not.toThrow();
  });

  it("rejects a theme whose value violates its declared type", () => {
    const broken = structuredClone(theme);
    // Reflect.set binds a dimension value to a color token.
    Reflect.set(broken.tokens["color.white"], "$value", {
      value: 4,
      unit: "px",
    });
    expect(() => makeUntheme<T>(broken, makeConfig())).toThrow(
      InvalidThemeError,
    );
  });

  it("keeps the base theme detached from the caller", () => {
    const base = structuredClone(theme);
    const u = makeUntheme<T>(base, makeConfig());
    Reflect.set(base.tokens["color.white"], "$value", black);
    expect(u.resolve("color.white")).toEqual(white);
  });

  it("rejects an incomplete selection", () => {
    const config = makeConfig();
    Reflect.deleteProperty(config.input, "contrast");
    expect(() => boot(config)).toThrow(InvalidThemeError);
  });

  it("rejects a cross-axis or unknown context", () => {
    const config = makeConfig();
    Reflect.set(config.input, "mode", "high");
    expect(() => boot(config)).toThrow(InvalidThemeError);
  });
});

describe("modifiers / contexts", () => {
  it("lists the axes in composition order", () => {
    expect(boot().modifiers()).toEqual(["mode", "contrast"]);
  });

  it("lists the contexts of an axis", () => {
    const u = boot();
    expect(u.contexts("mode")).toEqual(["light", "dark"]);
    expect(u.contexts("contrast")).toEqual(["normal", "high"]);
  });

  it("contexts throws a semantic error on an unknown axis", () => {
    const u = boot();
    expect(() => Reflect.apply(u.contexts, undefined, ["ghost"])).toThrow(
      UnknownModifierError,
    );
  });
});

describe("tokens / get", () => {
  it("flattens each token to its bound $value", () => {
    const u = boot();
    expect(u.tokens()["space.sm"]).toEqual({ value: 4, unit: "px" });
    expect(u.tokens()["color.accent"]).toEqual(blue);
  });

  it("composes base, then the selected context of each modifier", () => {
    const u = boot();
    expect(u.get("color.bg")).toBe("{color.white}");
    expect(u.get("color.fg")).toBe("{color.black}");
  });

  it("applies later modifiers in order over earlier ones", () => {
    const u = boot({
      ...makeConfig(),
      input: { mode: "dark", contrast: "high" },
    });
    // mode.dark sets fg to "{color.white}". contrast.high sets fg to "{color.black}".
    expect(u.get("color.bg")).toBe("{color.black}");
    expect(u.get("color.fg")).toBe("{color.black}");
  });

  it("peeks at another selection without changing the active one", () => {
    const u = boot();
    const peek = u.tokens({ mode: "dark", contrast: "normal" });
    expect(peek["color.bg"]).toBe("{color.black}");
    expect(u.config.input.mode).toBe("light");
    expect(u.get("color.bg")).toBe("{color.white}");
  });
});

describe("swap", () => {
  it("selects a context and re-resolves", () => {
    const u = boot();
    u.swap("mode", "dark");
    expect(u.config.input.mode).toBe("dark");
    expect(u.get("color.bg")).toBe("{color.black}");
  });

  it("touches only the named axis", () => {
    const u = boot();
    u.swap("mode", "dark");
    expect(u.config.input.contrast).toBe("normal");
  });

  it("rejects a context the modifier does not declare", () => {
    const u = boot();
    expect(() => Reflect.apply(u.swap, undefined, ["mode", "banana"])).toThrow(
      InvalidThemeError,
    );
    expect(u.config.input.mode).toBe("light");
  });
});

describe("set / dirty / reset (the override)", () => {
  it("set wins over the composed value", () => {
    const u = boot();
    u.set("color.bg", blue);
    expect(u.get("color.bg")).toEqual(blue);
  });

  it("the override is selection-independent", () => {
    const u = boot();
    u.set("color.bg", blue);
    u.swap("mode", "dark");
    expect(u.get("color.bg")).toEqual(blue);
  });

  it("is a no-op on an unknown token", () => {
    const u = boot();
    Reflect.apply(u.set, undefined, ["ghost", black]);
    expect(u.dirty()).toBe(false);
  });

  it("is a no-op on a value invalid for the token's declared type", () => {
    const u = boot();
    u.set("color.bg", { value: 4, unit: "px" });
    u.set("color.bg", "{ghost}");
    u.set("space.sm", blue);
    expect(u.dirty()).toBe(false);
  });

  it("stores a detached copy, so mutating the caller's value afterwards changes nothing", () => {
    const u = boot();
    const value = structuredClone(blue);
    u.set("color.bg", value);
    Reflect.set(value, "components", "garbage");
    expect(u.get("color.bg")).toEqual(blue);
  });

  it("dirty tracks the override; reset clears it", () => {
    const u = boot();
    expect(u.dirty()).toBe(false);
    u.set("color.bg", blue);
    expect(u.dirty()).toBe(true);
    u.reset();
    expect(u.dirty()).toBe(false);
    expect(u.get("color.bg")).toBe("{color.white}");
  });
});

describe("resolve", () => {
  it("follows a reference chain to a literal", () => {
    const u = boot();
    expect(u.resolve("color.bg")).toEqual(white);
    expect(u.resolve("color.fg")).toEqual(black);
  });

  it("returns a literal binding as-is", () => {
    const u = boot();
    expect(u.resolve("color.accent")).toEqual(blue);
    expect(u.resolve("space.sm")).toEqual({ value: 4, unit: "px" });
  });

  it("dereferences references nested inside composite values", () => {
    const u = boot();
    expect(u.resolve("border.thin")).toEqual({
      color: blue,
      width: { value: 4, unit: "px" },
      style: "solid",
    });
  });

  it("resolves sibling references to the same token without a false cycle", () => {
    const u = boot();
    expect(u.resolve("gradient.fade")).toEqual([
      { color: black, position: 0 },
      { color: black, position: 1 },
    ]);
  });

  it("resolves through the active selection and the override", () => {
    const u = boot();
    u.swap("mode", "dark");
    expect(u.resolve("color.bg")).toEqual(black);
    u.set("color.bg", "{color.accent}");
    expect(u.resolve("color.bg")).toEqual(blue);
  });

  it("throws on a reference cycle", () => {
    const u = boot();
    u.set("color.bg", "{color.fg}");
    u.set("color.fg", "{color.bg}");
    expect(() => u.resolve("color.bg")).toThrow(CircularAliasError);
  });
});

describe("theme", () => {
  it("is the base theme itself while no layer is applied", () => {
    const u = boot();
    expect(u.config.layer).toBeUndefined();
    expect(u.theme()).toBe(u.schema.base);
  });

  it("is the base theme with the layer merged in once a layer is applied", () => {
    const u = boot();
    u.apply({
      id: "alt",
      name: "Alt",
      tokens: { "color.bg": "{color.black}" },
    });
    const active = u.theme();
    expect(active).not.toBe(u.schema.base);
    expect(active.id).toBe("alt");
    expect(active.tokens["color.bg"].$value).toBe("{color.black}");
    expect(active.tokens["color.fg"].$value).toBe("{color.black}");
    expect(u.schema.base.tokens["color.bg"].$value).toBe("{color.white}");
  });

  it("merges once per layer object", () => {
    const u = boot();
    u.apply({
      id: "alt",
      name: "Alt",
      tokens: { "color.bg": "{color.black}" },
    });
    expect(u.theme()).toBe(u.theme());
    u.update({ tokens: { "color.fg": "{color.white}" } });
    expect(u.theme().tokens["color.fg"].$value).toBe("{color.white}");
  });

  it("follows a layer that the container receives from outside", () => {
    const config = makeConfig();
    const u = boot(config);
    config.layer = { id: "ext", name: "Ext", tokens: { "color.bg": blue } };
    expect(u.theme().id).toBe("ext");
    expect(u.get("color.bg")).toBe("{color.white}");
    u.swap("contrast", "high");
    expect(u.resolve("color.bg")).toEqual(white);
  });
});

describe("update", () => {
  it("rebinds $value and keeps $type, identity, and the override", () => {
    const u = boot();
    u.set("color.accent", "{color.white}");
    u.update({ tokens: { "color.bg": "{color.black}" } });
    expect(u.theme().tokens["color.bg"].$value).toBe("{color.black}");
    expect(u.theme().tokens["color.bg"].$type).toBe("color");
    expect(u.theme().id).toBe("demo");
    expect(u.dirty()).toBe(true);
    expect(u.get("color.accent")).toBe("{color.white}");
  });

  it("becomes a layer with the identity of the base when none is applied", () => {
    const u = boot();
    u.update({ tokens: { "color.bg": "{color.black}" } });
    expect(u.config.layer).toEqual({
      id: "demo",
      name: "Demo",
      tokens: { "color.bg": "{color.black}" },
    });
  });

  it("folds into the applied layer and keeps its identity", () => {
    const u = boot();
    u.apply({
      id: "alt",
      name: "Alt",
      tokens: { "color.bg": "{color.black}" },
      modifiers: { mode: { dark: { "color.fg": "{color.accent}" } } },
    });
    u.update({
      tokens: { "color.fg": "{color.white}" },
      modifiers: {
        mode: { dark: { "color.bg": "{color.accent}" } },
        contrast: { high: { "color.bg": "{color.black}" } },
      },
    });
    expect(u.config.layer).toEqual({
      id: "alt",
      name: "Alt",
      tokens: { "color.bg": "{color.black}", "color.fg": "{color.white}" },
      modifiers: {
        mode: {
          dark: { "color.fg": "{color.accent}", "color.bg": "{color.accent}" },
        },
        contrast: { high: { "color.bg": "{color.black}" } },
      },
    });
  });

  it("stores detached copies of the values of the patch", () => {
    const u = boot();
    const value = structuredClone(white);
    u.update({ tokens: { "color.accent": value } });
    Reflect.set(value, "components", "garbage");
    expect(u.resolve("color.accent")).toEqual(white);
  });

  it("rejects a patch outside the contract", () => {
    const u = boot();
    const unknown = { tokens: { "color.bg": "{color.black}", ghost: black } };
    expect(() => u.update(unknown)).toThrow(InvalidPatchError);
    expect(() =>
      u.update({ tokens: { "color.bg": { value: 4, unit: "px" } } }),
    ).toThrow(InvalidPatchError);
  });
});

describe("delta", () => {
  it("is all-empty when nothing has drifted from the baseline", () => {
    const u = boot();
    expect(u.delta()).toEqual({
      tokens: {},
      modifiers: {
        mode: { light: {}, dark: {} },
        contrast: { normal: {}, high: {} },
      },
    });
  });

  it("captures both the override and the definition drift", () => {
    const u = boot();
    u.set("color.accent", "{color.white}");
    u.update({
      tokens: { "color.bg": "{color.black}" },
      modifiers: { mode: { dark: { "color.bg": "{color.accent}" } } },
    });
    const d = u.delta();
    expect(d.tokens).toEqual({
      "color.accent": "{color.white}",
      "color.bg": "{color.black}",
    });
    expect(d.modifiers.mode.dark).toEqual({ "color.bg": "{color.accent}" });
  });

  it("round-trips: updating a fresh baseline with the delta reproduces the drift", () => {
    const u = boot();
    u.set("color.accent", "{color.white}");
    u.update({ tokens: { "color.bg": "{color.black}" } });

    const fresh = boot();
    fresh.update(u.delta());
    expect(fresh.theme().tokens["color.bg"].$value).toBe("{color.black}");
    expect(fresh.theme().tokens["color.accent"].$value).toBe("{color.white}");
  });
});

describe("apply", () => {
  it("becomes the layer over the baseline and clears the override", () => {
    const u = boot();
    u.set("color.bg", blue);
    u.apply({
      id: "alt",
      name: "Alt",
      tokens: { "color.accent": "{color.white}" },
    });
    expect(u.theme().id).toBe("alt");
    expect(u.dirty()).toBe(false);
    expect(u.get("color.accent")).toBe("{color.white}");
    expect(u.theme().tokens["color.accent"].$type).toBe("color");
  });

  it("stores a detached copy of the layer in the container", () => {
    const config = makeConfig();
    const u = boot(config);
    const layer = {
      id: "alt",
      name: "Alt",
      tokens: { "color.accent": structuredClone(white) },
    };
    u.apply(layer);
    expect(config.layer).toEqual(layer);
    expect(config.layer).not.toBe(layer);
    Reflect.set(layer.tokens["color.accent"], "components", "garbage");
    expect(u.resolve("color.accent")).toEqual(white);
  });

  it("rejects a layer outside the contract and keeps the state", () => {
    const u = boot();
    const bad = { id: "bad", name: "Bad", tokens: { ghost: black } };
    expect(() => u.apply(bad as never)).toThrow(InvalidLayerError);
    expect(u.config.layer).toBeUndefined();
  });

  it("resolves each apply against the baseline, not the prior theme", () => {
    const u = boot();
    u.apply({
      id: "l1",
      name: "L1",
      tokens: { "color.accent": "{color.white}" },
    });
    u.apply({ id: "l2", name: "L2", tokens: { "color.bg": "{color.accent}" } });
    // The accent change from l1 is not in the result.
    expect(u.get("color.accent")).toEqual(blue);
  });
});

describe("create / extract", () => {
  it("create returns the validated layer unchanged", () => {
    const u = boot();
    const layer = {
      id: "made",
      name: "Made",
      tokens: { "color.bg": "{color.accent}" } as const,
    };
    expect(u.create(layer)).toBe(layer);
    expect(u.theme().id).toBe("demo");
  });

  it("create rejects a layer outside the contract", () => {
    const u = boot();
    const tokens = { "color.bg": "{color.black}", ghost: black };
    const bad = { id: "bad", name: "Bad", tokens };
    expect(() => u.create(bad)).toThrow(InvalidLayerError);
  });

  it("extract bakes the override into a detached snapshot", () => {
    const u = boot();
    u.set("color.bg", blue);
    const snap = u.extract("snap", "Snap");
    expect(snap.id).toBe("snap");
    expect(snap.tokens["color.bg"].$value).toEqual(blue);
    expect(snap.tokens["color.bg"].$type).toBe("color");
    expect(u.theme().id).toBe("demo");
  });

  it("extract rejects an empty identity", () => {
    const u = boot();
    expect(() => u.extract("", "")).toThrow(InvalidThemeError);
  });
});

describe("Options middleware", () => {
  it("intercepts reads of the selection", () => {
    const u = boot(makeConfig(), {
      get: {
        config: { input: () => ({ mode: "dark", contrast: "normal" }) },
      },
    });
    expect(u.get("color.bg")).toBe("{color.black}");
  });

  it("intercepts writes of the override", () => {
    const writes: unknown[] = [];
    const u = boot(makeConfig(), {
      set: {
        config: {
          override: (override) => {
            writes.push(override);
            return override;
          },
        },
      },
    });
    u.set("color.bg", blue);
    expect(writes).toHaveLength(1);
    expect(writes[0]).toEqual({ "color.bg": blue });
  });

  it("intercepts reads of the layer", () => {
    const u = boot(makeConfig(), {
      get: {
        config: { layer: () => ({ id: "seen", name: "Seen" }) },
      },
    });
    expect(u.theme().name).toBe("Seen");
    expect(u.config.layer?.id).toBe("seen");
  });

  it("intercepts reads of the override", () => {
    const u = boot(makeConfig(), {
      get: {
        config: { override: () => ({ "color.bg": blue }) },
      },
    });
    expect(u.get("color.bg")).toEqual(blue);
    expect(u.dirty()).toBe(true);
  });

  it("intercepts writes of the layer", () => {
    const writes: unknown[] = [];
    const u = boot(makeConfig(), {
      set: {
        config: {
          layer: (value) => {
            writes.push(value.id);
            return value;
          },
        },
      },
    });
    u.apply({ id: "alt", name: "Alt", tokens: {} });
    u.update({ tokens: { "color.bg": "{color.black}" } });
    expect(writes).toEqual(["alt", "alt"]);
    expect(u.theme().id).toBe("alt");
  });
});
