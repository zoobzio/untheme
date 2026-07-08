import type { Contract, Input, Overrides } from "@untheme/schema";
import type { Mod, Tok } from "./fixture";

import { describe, it, expect } from "vitest";

import { defineUntheme } from "../src/service";
import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownThemeError,
} from "../src/error";
import { black, blue, theme, white } from "./fixture";

type T = Contract<Tok, Mod>;

const makeConfig = (): {
  theme: T;
  input: Input<T>;
  override: Overrides<T>;
} => ({
  theme: structuredClone(theme),
  input: { mode: "light", contrast: "normal" },
  override: {},
});

describe("construction", () => {
  it("builds over a valid theme and selection", () => {
    expect(() => defineUntheme(makeConfig())).not.toThrow();
  });

  it("rejects a theme whose value violates its declared type", () => {
    const config = makeConfig();
    // A dimension object bound to a color token; Reflect skirts the compile-time
    // contract so the runtime check is what rejects it.
    Reflect.set(config.theme.tokens["color.white"], "$value", {
      value: 4,
      unit: "px",
    });
    expect(() => defineUntheme(config)).toThrow(InvalidThemeError);
  });

  it("rejects an incomplete selection", () => {
    const config = makeConfig();
    Reflect.deleteProperty(config.input, "contrast");
    expect(() => defineUntheme(config)).toThrow(InvalidThemeError);
  });

  it("rejects a cross-axis or unknown context", () => {
    const config = makeConfig();
    Reflect.set(config.input, "mode", "high");
    expect(() => defineUntheme(config)).toThrow(InvalidThemeError);
  });

  it("rejects a malformed seed layer", () => {
    const tokens = { "color.bg": "{color.black}", ghost: black };
    const bad = { id: "bad", name: "Bad", tokens };
    expect(() => defineUntheme(makeConfig(), { bad })).toThrow(
      InvalidLayerError,
    );
  });
});

describe("modifiers / contexts", () => {
  it("lists the axes in composition order", () => {
    expect(defineUntheme(makeConfig()).modifiers()).toEqual([
      "mode",
      "contrast",
    ]);
  });

  it("lists the contexts of an axis", () => {
    const u = defineUntheme(makeConfig());
    expect(u.contexts("mode")).toEqual(["light", "dark"]);
    expect(u.contexts("contrast")).toEqual(["normal", "high"]);
  });
});

describe("tokens / get", () => {
  it("flattens each token to its bound $value", () => {
    const u = defineUntheme(makeConfig());
    expect(u.tokens()["space.sm"]).toEqual({ value: 4, unit: "px" });
    expect(u.tokens()["color.accent"]).toEqual(blue);
  });

  it("composes base, then the selected context of each modifier", () => {
    const u = defineUntheme(makeConfig());
    expect(u.get("color.bg")).toBe("{color.white}");
    expect(u.get("color.fg")).toBe("{color.black}");
  });

  it("applies later modifiers in order over earlier ones", () => {
    const u = defineUntheme({
      ...makeConfig(),
      input: { mode: "dark", contrast: "high" },
    });
    // mode.dark sets fg "{color.white}"; contrast.high (later) overrides it
    expect(u.get("color.bg")).toBe("{color.black}");
    expect(u.get("color.fg")).toBe("{color.black}");
  });

  it("peeks at another selection without changing the active one", () => {
    const u = defineUntheme(makeConfig());
    const peek = u.tokens({ mode: "dark", contrast: "normal" });
    expect(peek["color.bg"]).toBe("{color.black}");
    expect(u.config.input.mode).toBe("light");
    expect(u.get("color.bg")).toBe("{color.white}");
  });
});

describe("swap", () => {
  it("selects a context and re-resolves", () => {
    const u = defineUntheme(makeConfig());
    u.swap("mode", "dark");
    expect(u.config.input.mode).toBe("dark");
    expect(u.get("color.bg")).toBe("{color.black}");
  });

  it("touches only the named axis", () => {
    const u = defineUntheme(makeConfig());
    u.swap("mode", "dark");
    expect(u.config.input.contrast).toBe("normal");
  });
});

describe("set / dirty / reset (the override)", () => {
  it("set wins over the composed value", () => {
    const u = defineUntheme(makeConfig());
    u.set("color.bg", blue);
    expect(u.get("color.bg")).toEqual(blue);
  });

  it("the override is selection-independent", () => {
    const u = defineUntheme(makeConfig());
    u.set("color.bg", blue);
    u.swap("mode", "dark");
    expect(u.get("color.bg")).toEqual(blue);
  });

  it("is a no-op on an unknown token", () => {
    const u = defineUntheme(makeConfig());
    Reflect.apply(u.set, undefined, ["ghost", black]);
    expect(u.dirty()).toBe(false);
  });

  it("is a no-op on a value invalid for the token's declared type", () => {
    const u = defineUntheme(makeConfig());
    u.set("color.bg", { value: 4, unit: "px" });
    u.set("color.bg", "{ghost}");
    u.set("space.sm", blue);
    expect(u.dirty()).toBe(false);
  });

  it("dirty tracks the override; reset clears it", () => {
    const u = defineUntheme(makeConfig());
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
    const u = defineUntheme(makeConfig());
    expect(u.resolve("color.bg")).toEqual(white);
    expect(u.resolve("color.fg")).toEqual(black);
  });

  it("returns a literal binding as-is", () => {
    const u = defineUntheme(makeConfig());
    expect(u.resolve("color.accent")).toEqual(blue);
    expect(u.resolve("space.sm")).toEqual({ value: 4, unit: "px" });
  });

  it("dereferences references nested inside composite values", () => {
    const u = defineUntheme(makeConfig());
    expect(u.resolve("border.thin")).toEqual({
      color: blue,
      width: { value: 4, unit: "px" },
      style: "solid",
    });
  });

  it("resolves sibling references to the same token without a false cycle", () => {
    const u = defineUntheme(makeConfig());
    expect(u.resolve("gradient.fade")).toEqual([
      { color: black, position: 0 },
      { color: black, position: 1 },
    ]);
  });

  it("resolves through the active selection and the override", () => {
    const u = defineUntheme(makeConfig());
    u.swap("mode", "dark");
    expect(u.resolve("color.bg")).toEqual(black);
    u.set("color.bg", "{color.accent}");
    expect(u.resolve("color.bg")).toEqual(blue);
  });

  it("throws on a reference cycle", () => {
    const u = defineUntheme(makeConfig());
    u.set("color.bg", "{color.fg}");
    u.set("color.fg", "{color.bg}");
    expect(() => u.resolve("color.bg")).toThrow(CircularAliasError);
  });
});

describe("update", () => {
  it("rebinds $value and keeps $type, identity, and the override", () => {
    const u = defineUntheme(makeConfig());
    u.set("color.accent", "{color.white}");
    u.update({ tokens: { "color.bg": "{color.black}" } });
    expect(u.config.theme.tokens["color.bg"].$value).toBe("{color.black}");
    expect(u.config.theme.tokens["color.bg"].$type).toBe("color");
    expect(u.config.theme.id).toBe("demo");
    expect(u.dirty()).toBe(true);
    expect(u.get("color.accent")).toBe("{color.white}");
  });

  it("rejects a patch outside the contract", () => {
    const u = defineUntheme(makeConfig());
    const unknown = { tokens: { "color.bg": "{color.black}", ghost: black } };
    expect(() => u.update(unknown)).toThrow(InvalidPatchError);
    expect(() =>
      u.update({ tokens: { "color.bg": { value: 4, unit: "px" } } }),
    ).toThrow(InvalidPatchError);
  });
});

describe("delta", () => {
  it("is all-empty when nothing has drifted from the baseline", () => {
    const u = defineUntheme(makeConfig());
    expect(u.delta()).toEqual({
      tokens: {},
      modifiers: {
        mode: { light: {}, dark: {} },
        contrast: { normal: {}, high: {} },
      },
    });
  });

  it("captures both the override and the definition drift", () => {
    const u = defineUntheme(makeConfig());
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
    const u = defineUntheme(makeConfig());
    u.set("color.accent", "{color.white}");
    u.update({ tokens: { "color.bg": "{color.black}" } });

    const fresh = defineUntheme(makeConfig());
    fresh.update(u.delta());
    expect(fresh.config.theme.tokens["color.bg"].$value).toBe("{color.black}");
    expect(fresh.config.theme.tokens["color.accent"].$value).toBe(
      "{color.white}",
    );
  });
});

describe("apply / select", () => {
  it("becomes the layer over the baseline and clears the override", () => {
    const u = defineUntheme(makeConfig());
    u.set("color.bg", blue);
    u.apply({
      id: "alt",
      name: "Alt",
      tokens: { "color.accent": "{color.white}" },
    });
    expect(u.config.theme.id).toBe("alt");
    expect(u.dirty()).toBe(false);
    expect(u.get("color.accent")).toBe("{color.white}");
    expect(u.config.theme.tokens["color.accent"].$type).toBe("color");
  });

  it("resolves each apply against the baseline, not the prior theme", () => {
    const u = defineUntheme(makeConfig());
    u.apply({
      id: "l1",
      name: "L1",
      tokens: { "color.accent": "{color.white}" },
    });
    u.apply({ id: "l2", name: "L2", tokens: { "color.bg": "{color.accent}" } });
    // l1's accent change is gone — l2 resolved against the baseline
    expect(u.get("color.accent")).toEqual(blue);
  });

  it("select applies a catalog layer; an unknown key throws", () => {
    const u = defineUntheme(makeConfig(), {
      alt: {
        id: "alt",
        name: "Alt",
        tokens: { "color.accent": "{color.white}" },
      },
    });
    u.select("alt");
    expect(u.config.theme.id).toBe("alt");
    expect(u.get("color.accent")).toBe("{color.white}");
    expect(() => u.select("missing")).toThrow(UnknownThemeError);
  });
});

describe("create / extract / remove", () => {
  it("create files the layer and returns it resolved against the baseline", () => {
    const u = defineUntheme(makeConfig());
    const layer = {
      id: "made",
      name: "Made",
      tokens: { "color.bg": "{color.accent}" } as const,
    };
    const made = u.create(layer);
    expect(u.themes.made).toEqual(layer);
    expect(u.themes.made).not.toBe(layer);
    expect(made.id).toBe("made");
    expect(made.tokens["color.bg"].$value).toBe("{color.accent}");
    expect(made.tokens["color.bg"].$type).toBe("color");
    expect(u.config.theme.id).toBe("demo");
  });

  it("created layers are reachable by select", () => {
    const u = defineUntheme(makeConfig());
    u.create({
      id: "made",
      name: "Made",
      tokens: { "color.accent": "{color.white}" },
    });
    u.select("made");
    expect(u.config.theme.id).toBe("made");
    expect(u.get("color.accent")).toBe("{color.white}");
  });

  it("create rejects a layer outside the contract", () => {
    const u = defineUntheme(makeConfig());
    const tokens = { "color.bg": "{color.black}", ghost: black };
    const bad = { id: "bad", name: "Bad", tokens };
    expect(() => u.create(bad)).toThrow(InvalidLayerError);
    expect(u.themes.bad).toBeUndefined();
  });

  it("extract bakes the override into a detached snapshot", () => {
    const u = defineUntheme(makeConfig());
    u.set("color.bg", blue);
    const snap = u.extract("snap", "Snap");
    expect(snap.id).toBe("snap");
    expect(snap.tokens["color.bg"].$value).toEqual(blue);
    expect(snap.tokens["color.bg"].$type).toBe("color");
    expect(u.themes.snap).toBeUndefined();
    expect(u.config.theme.id).toBe("demo");
  });

  it("remove drops a catalog entry", () => {
    const u = defineUntheme(makeConfig(), {
      alt: { id: "alt", name: "Alt", tokens: {} },
    });
    expect(u.themes.alt).toBeDefined();
    u.remove("alt");
    expect(u.themes.alt).toBeUndefined();
  });
});

describe("Options middleware", () => {
  it("intercepts reads of the selection", () => {
    const u = defineUntheme(
      makeConfig(),
      {},
      {
        get: {
          config: { input: () => ({ mode: "dark", contrast: "normal" }) },
        },
      },
    );
    // reads see dark regardless of the stored selection
    expect(u.get("color.bg")).toBe("{color.black}");
  });

  it("intercepts writes of the override", () => {
    const writes: unknown[] = [];
    const u = defineUntheme(
      makeConfig(),
      {},
      {
        set: {
          config: {
            override: (override) => {
              writes.push(override);
              return override;
            },
          },
        },
      },
    );
    u.set("color.bg", blue);
    expect(writes).toHaveLength(1);
    expect(writes[0]).toEqual({ "color.bg": blue });
  });

  it("intercepts writes of the theme", () => {
    const writes: unknown[] = [];
    const u = defineUntheme(
      makeConfig(),
      {},
      {
        set: {
          config: {
            theme: (value) => {
              writes.push(value.id);
              return value;
            },
          },
        },
      },
    );
    u.apply({ id: "alt", name: "Alt", tokens: {} });
    expect(writes).toEqual(["alt"]);
    expect(u.config.theme.id).toBe("alt");
  });
});
