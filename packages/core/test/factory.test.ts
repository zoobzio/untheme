import type { Contract, Input, Patch } from "@untheme/schema";
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

const makeConfig = (): { patch: Patch<T>; input: Input<T> } => ({
  patch: {},
  input: { mode: "light", contrast: "normal" },
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

  it("resolves through the active selection and the patch", () => {
    const u = boot();
    u.swap("mode", "dark");
    expect(u.resolve("color.bg")).toEqual(black);
    u.update({ modifiers: { mode: { dark: { "color.bg": "{color.accent}" } } } });
    expect(u.resolve("color.bg")).toEqual(blue);
  });

  it("throws on a reference cycle", () => {
    const u = boot();
    // The base binds color.bg to {color.white}.
    u.update({ tokens: { "color.white": "{color.bg}" } });
    expect(() => u.resolve("color.bg")).toThrow(CircularAliasError);
  });
});

describe("theme", () => {
  it("equals the base theme while the patch is empty", () => {
    const u = boot();
    expect(u.config.patch).toEqual({});
    expect(u.theme()).toEqual(u.schema.base);
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

  it("merges once per patch object", () => {
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

  it("follows a patch that the container receives from outside", () => {
    const config = makeConfig();
    const u = boot(config);
    config.patch = { id: "ext", name: "Ext", tokens: { "color.bg": blue } };
    expect(u.theme().id).toBe("ext");
    expect(u.get("color.bg")).toBe("{color.white}");
    u.swap("contrast", "high");
    expect(u.resolve("color.bg")).toEqual(white);
  });
});

describe("update", () => {
  it("rebinds $value and keeps $type and identity", () => {
    const u = boot();
    u.update({ tokens: { "color.bg": "{color.black}" } });
    expect(u.theme().tokens["color.bg"].$value).toBe("{color.black}");
    expect(u.theme().tokens["color.bg"].$type).toBe("color");
    expect(u.theme().id).toBe("demo");
  });

  it("stores the bindings with no identity when none is applied", () => {
    const u = boot();
    u.update({ tokens: { "color.bg": "{color.black}" } });
    expect(u.config.patch.id).toBeUndefined();
    expect(u.config.patch.tokens).toEqual({ "color.bg": "{color.black}" });
    expect(u.theme().id).toBe("demo");
  });

  it("takes an identity and an order from the patch", () => {
    const u = boot();
    u.update({ id: "p", name: "P", order: ["contrast", "mode"] });
    expect(u.theme().id).toBe("p");
    expect(u.theme().name).toBe("P");
    expect(u.modifiers()).toEqual(["contrast", "mode"]);
  });

  it("merges into the applied layer and keeps its identity", () => {
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
    expect(u.config.patch).toMatchObject({
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

  it("captures the token and the context drift", () => {
    const u = boot();
    u.update({
      tokens: { "color.accent": "{color.white}", "color.bg": "{color.black}" },
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
    u.update({
      tokens: { "color.accent": "{color.white}", "color.bg": "{color.black}" },
    });

    const fresh = boot();
    fresh.update(u.delta());
    expect(fresh.theme().tokens["color.bg"].$value).toBe("{color.black}");
    expect(fresh.theme().tokens["color.accent"].$value).toBe("{color.white}");
  });
});

describe("apply", () => {
  it("becomes the layer over the baseline", () => {
    const u = boot();
    u.apply({
      id: "alt",
      name: "Alt",
      tokens: { "color.accent": "{color.white}" },
    });
    expect(u.theme().id).toBe("alt");
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
    expect(config.patch).toEqual(layer);
    expect(config.patch).not.toBe(layer);
    Reflect.set(layer.tokens["color.accent"], "components", "garbage");
    expect(u.resolve("color.accent")).toEqual(white);
  });

  it("rejects a layer outside the contract and keeps the state", () => {
    const u = boot();
    const bad = { id: "bad", name: "Bad", tokens: { ghost: black } };
    expect(() => u.apply(bad as never)).toThrow(InvalidLayerError);
    expect(u.config.patch).toEqual({});
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

  it("extract returns a detached snapshot of the active theme", () => {
    const u = boot();
    u.update({ tokens: { "color.bg": blue } });
    const snap = u.extract("snap", "Snap");
    expect(snap.id).toBe("snap");
    expect(snap.tokens["color.bg"].$value).toEqual(blue);
    expect(snap.tokens["color.bg"].$type).toBe("color");
    expect(snap).not.toBe(u.theme());
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

  it("intercepts reads of the patch", () => {
    const u = boot(makeConfig(), {
      get: {
        config: { patch: () => ({ id: "seen", name: "Seen" }) },
      },
    });
    expect(u.theme().name).toBe("Seen");
    expect(u.config.patch.id).toBe("seen");
  });

  it("intercepts writes of the patch", () => {
    const writes: unknown[] = [];
    const u = boot(makeConfig(), {
      set: {
        config: {
          patch: (value) => {
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
