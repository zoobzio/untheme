import type { Contract } from "@untheme/schema";

import { describe, it, expect } from "vitest";

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
  it("seeds a container with the theme, the selection, and an empty override", () => {
    const seeded = useUnthemeConfig(config);
    expect(seeded.theme).toEqual(config.theme);
    expect(seeded.input).toEqual(config.input);
    expect(seeded.override).toEqual({});
  });

  it("holds nothing by reference, so the authored config stays detached", () => {
    const seeded = useUnthemeConfig(config);
    expect(seeded.theme).not.toBe(config.theme);
    expect(seeded.theme.tokens.primary).not.toBe(config.theme.tokens.primary);
    expect(seeded.input).not.toBe(config.input);
  });

  it("seeds an independent container per call", () => {
    const first = useUnthemeConfig(config);
    const second = useUnthemeConfig(config);
    expect(first.theme).not.toBe(second.theme);
    expect(first.input).not.toBe(second.input);
    expect(first.override).not.toBe(second.override);
  });
});
