import type { Contract } from "@untheme/schema";

import { describe, it, expect } from "vitest";

import { makeUntheme } from "@untheme/core";

import {
  defineUnthemeConfig,
  useUnthemeConfig,
  type UnthemeConfig,
} from "../src/config";

type Tok = "primary";
type Mod = { mode: { light: object; dark: object } };

const config: UnthemeConfig<Contract<Tok, Mod>> = {
  theme: {
    id: "demo",
    name: "Demo",
    tokens: {
      primary: {
        $type: "color",
        $value: { colorSpace: "srgb", components: [0, 0, 0] },
      },
    },
    modifiers: { mode: { light: {}, dark: {} } },
    order: ["mode"],
  },
  input: { mode: "light" },
};

describe("defineUnthemeConfig", () => {
  it("returns the same config, narrowed to its inferred types", () => {
    const typed = defineUnthemeConfig(config);
    expect(typed).toBe(config);
    expect(typed.theme.tokens.primary.$type).toBe("color");
    expect(typed.input.mode).toBe("light");
  });
});

describe("useUnthemeConfig", () => {
  it("seeds a container with an empty patch and the selection", () => {
    const seeded = useUnthemeConfig(config);
    expect(seeded).toEqual({ patch: {}, input: config.input });
  });

  it("holds nothing by reference, so the authored config stays detached", () => {
    const seeded = useUnthemeConfig(config);
    expect(seeded.input).not.toBe(config.input);
  });

  it("seeds an independent container per call", () => {
    const first = useUnthemeConfig(config);
    const second = useUnthemeConfig(config);
    expect(first.input).not.toBe(second.input);
    expect(first.patch).not.toBe(second.patch);
  });

  it("boots a service beside the theme of the config", () => {
    const ut = makeUntheme(config.theme, useUnthemeConfig(config));
    expect(ut.theme()).toEqual(ut.schema.base);
    expect(ut.get("primary")).toEqual(config.theme.tokens.primary.$value);
  });
});
