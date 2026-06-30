import { describe, it, expect } from "vitest";

import { defineUntheme } from "../src/service";
import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownThemeError,
} from "../src/error";

const theme = {
  id: "demo",
  name: "Demo",
  tokens: {
    white: "#ffffff",
    black: "#000000",
    accent: "#0090ff",
    bg: "{white}",
    fg: "{black}",
    ring: "{accent}",
  },
  modifiers: {
    color: {
      light: { bg: "{white}", fg: "{black}" },
      dark: { bg: "{black}", fg: "{white}" },
    },
    contrast: {
      normal: {},
      high: { fg: "{black}" },
    },
  },
  order: ["color", "contrast"],
};

const makeConfig = () => ({
  theme: structuredClone(theme),
  input: { color: "light", contrast: "normal" },
  override: {},
});

describe("construction", () => {
  it("builds over a valid theme and selection", () => {
    expect(() => defineUntheme(makeConfig())).not.toThrow();
  });

  it("rejects an incomplete selection", () => {
    expect(() =>
      defineUntheme({ ...makeConfig(), input: { color: "light" } }),
    ).toThrow(InvalidThemeError);
  });

  it("rejects a cross-axis or unknown context", () => {
    expect(() =>
      defineUntheme({
        ...makeConfig(),
        input: { color: "high", contrast: "normal" },
      }),
    ).toThrow(InvalidThemeError);
  });

  it("rejects a malformed seed layer", () => {
    expect(() =>
      defineUntheme(makeConfig(), {
        bad: { id: "bad", name: "Bad", tokens: { ghost: "#000" } },
      }),
    ).toThrow(InvalidLayerError);
  });
});

describe("modifiers / contexts", () => {
  it("lists the axes in composition order", () => {
    expect(defineUntheme(makeConfig()).modifiers()).toEqual([
      "color",
      "contrast",
    ]);
  });

  it("lists the contexts of an axis", () => {
    const u = defineUntheme(makeConfig());
    expect(u.contexts("color")).toEqual(["light", "dark"]);
    expect(u.contexts("contrast")).toEqual(["normal", "high"]);
  });
});

describe("tokens / get", () => {
  it("composes base, then the selected context of each modifier", () => {
    const u = defineUntheme(makeConfig());
    expect(u.get("bg")).toBe("{white}");
    expect(u.get("fg")).toBe("{black}");
    expect(u.get("ring")).toBe("{accent}");
  });

  it("applies later modifiers in order over earlier ones", () => {
    const u = defineUntheme({
      ...makeConfig(),
      input: { color: "dark", contrast: "high" },
    });
    // color.dark sets fg "{white}"; contrast.high (later) overrides it "{black}"
    expect(u.get("bg")).toBe("{black}");
    expect(u.get("fg")).toBe("{black}");
  });

  it("peeks at another selection without changing the active one", () => {
    const u = defineUntheme(makeConfig());
    expect(u.tokens({ color: "dark", contrast: "normal" }).bg).toBe("{black}");
    expect(u.config.input.color).toBe("light");
    expect(u.get("bg")).toBe("{white}");
  });
});

describe("swap", () => {
  it("selects a context and re-resolves", () => {
    const u = defineUntheme(makeConfig());
    u.swap("color", "dark");
    expect(u.config.input.color).toBe("dark");
    expect(u.get("bg")).toBe("{black}");
  });

  it("touches only the named axis", () => {
    const u = defineUntheme(makeConfig());
    u.swap("color", "dark");
    expect(u.config.input.contrast).toBe("normal");
  });
});

describe("set / dirty / reset (the override)", () => {
  it("set wins over the composed value", () => {
    const u = defineUntheme(makeConfig());
    u.set("bg", "#123456");
    expect(u.get("bg")).toBe("#123456");
  });

  it("the override is selection-independent", () => {
    const u = defineUntheme(makeConfig());
    u.set("bg", "#123456");
    u.swap("color", "dark");
    expect(u.get("bg")).toBe("#123456");
  });

  it("is a no-op on an unknown token or invalid value", () => {
    const u = defineUntheme(makeConfig());
    u.set("ghost", "#000");
    u.set("bg", "red;}");
    u.set("bg", "{ghost}");
    expect(u.dirty()).toBe(false);
  });

  it("dirty tracks the override; reset clears it", () => {
    const u = defineUntheme(makeConfig());
    expect(u.dirty()).toBe(false);
    u.set("bg", "#123456");
    expect(u.dirty()).toBe(true);
    u.reset();
    expect(u.dirty()).toBe(false);
    expect(u.get("bg")).toBe("{white}");
  });
});

describe("resolve", () => {
  it("follows a reference chain to a literal", () => {
    const u = defineUntheme(makeConfig());
    expect(u.resolve("bg")).toBe("#ffffff"); // bg -> {white} -> #ffffff
    expect(u.resolve("ring")).toBe("#0090ff"); // ring -> {accent} -> #0090ff
  });

  it("returns a literal binding as-is", () => {
    expect(defineUntheme(makeConfig()).resolve("white")).toBe("#ffffff");
  });

  it("resolves through the override", () => {
    const u = defineUntheme(makeConfig());
    u.set("bg", "{accent}");
    expect(u.resolve("bg")).toBe("#0090ff");
  });

  it("throws on a reference cycle", () => {
    const u = defineUntheme(makeConfig());
    u.set("bg", "{fg}");
    u.set("fg", "{bg}");
    expect(() => u.resolve("bg")).toThrow(CircularAliasError);
  });
});

describe("update", () => {
  it("merges a patch into the definition and keeps the override", () => {
    const u = defineUntheme(makeConfig());
    u.set("ring", "#111111");
    u.update({ tokens: { bg: "{accent}" } });
    expect(u.config.theme.tokens.bg).toBe("{accent}");
    expect(u.dirty()).toBe(true);
    expect(u.get("ring")).toBe("#111111");
  });

  it("rejects a patch outside the contract", () => {
    const u = defineUntheme(makeConfig());
    expect(() => u.update({ tokens: { ghost: "#000" } })).toThrow(
      InvalidPatchError,
    );
  });
});

describe("delta", () => {
  it("is all-empty when nothing has drifted from the baseline", () => {
    const u = defineUntheme(makeConfig());
    expect(u.delta()).toEqual({
      tokens: {},
      modifiers: {
        color: { light: {}, dark: {} },
        contrast: { normal: {}, high: {} },
      },
    });
  });

  it("captures both the override and the definition drift", () => {
    const u = defineUntheme(makeConfig());
    u.set("ring", "#111111");
    u.update({
      tokens: { bg: "{accent}" },
      modifiers: { color: { dark: { bg: "{accent}" } } },
    });
    const d = u.delta();
    expect(d.tokens).toEqual({ ring: "#111111", bg: "{accent}" });
    expect(d.modifiers.color.dark).toEqual({ bg: "{accent}" });
  });

  it("round-trips: updating a fresh baseline with the delta reproduces the drift", () => {
    const u = defineUntheme(makeConfig());
    u.set("ring", "#111111");
    u.update({ tokens: { bg: "{accent}" } });

    const fresh = defineUntheme(makeConfig());
    fresh.update(u.delta());
    expect(fresh.config.theme.tokens.bg).toBe("{accent}");
    expect(fresh.config.theme.tokens.ring).toBe("#111111");
  });
});

describe("apply / select", () => {
  it("becomes the layer over the baseline and clears the override", () => {
    const u = defineUntheme(makeConfig());
    u.set("bg", "#123456");
    u.apply({ id: "alt", name: "Alt", tokens: { ring: "{white}" } });
    expect(u.config.theme.id).toBe("alt");
    expect(u.dirty()).toBe(false);
    expect(u.get("ring")).toBe("{white}");
  });

  it("resolves each apply against the baseline, not the prior theme", () => {
    const u = defineUntheme(makeConfig());
    u.apply({ id: "l1", name: "L1", tokens: { ring: "{white}" } });
    u.apply({ id: "l2", name: "L2", tokens: { bg: "{accent}" } });
    // l1's ring change is gone — l2 resolved against the baseline
    expect(u.get("ring")).toBe("{accent}");
  });

  it("select applies a catalog layer; an unknown key throws", () => {
    const u = defineUntheme(makeConfig(), {
      alt: { id: "alt", name: "Alt", tokens: { ring: "{white}" } },
    });
    u.select("alt");
    expect(u.config.theme.id).toBe("alt");
    expect(u.get("ring")).toBe("{white}");
    expect(() => u.select("missing")).toThrow(UnknownThemeError);
  });
});

describe("create / extract / remove", () => {
  it("create files a resolved theme without touching the active one", () => {
    const u = defineUntheme(makeConfig());
    const made = u.create({
      id: "made",
      name: "Made",
      tokens: { bg: "{accent}" },
    });
    expect(made.tokens.bg).toBe("{accent}");
    expect(u.themes.made).toBeDefined();
    expect(u.config.theme.id).toBe("demo");
  });

  it("extract bakes the override into a detached snapshot", () => {
    const u = defineUntheme(makeConfig());
    u.set("bg", "#123456");
    const snap = u.extract("snap", "Snap");
    expect(snap.id).toBe("snap");
    expect(snap.tokens.bg).toBe("#123456");
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
          config: { input: () => ({ color: "dark", contrast: "normal" }) },
        },
      },
    );
    // reads see dark regardless of the stored selection
    expect(u.get("bg")).toBe("{black}");
  });

  it("intercepts writes of the override", () => {
    const writes: unknown[] = [];
    const u = defineUntheme(
      makeConfig(),
      {},
      {
        set: {
          config: {
            override: (o) => {
              writes.push(o);
              return o;
            },
          },
        },
      },
    );
    u.set("bg", "#123456");
    expect(writes).toHaveLength(1);
    expect(writes[0]).toEqual({ bg: "#123456" });
  });
});
