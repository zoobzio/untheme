import type { Contract } from "@untheme/schema";

import { describe, it, expect } from "vitest";

import { defineUnthemeConfig, type UnthemeConfig } from "../src/config";

type Tok = "primary";
type Mod = { mode: { light: object; dark: object } };

describe("defineUnthemeConfig", () => {
  it("returns the same config, narrowed to its inferred types", () => {
    const config: UnthemeConfig<Contract<Tok, Mod>> = {
      base: {
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
      themes: {},
      input: { mode: "light" },
    };

    const typed = defineUnthemeConfig(config);
    expect(typed).toBe(config);
    expect(typed.base.tokens.primary.$type).toBe("color");
    expect(typed.input.mode).toBe("light");
  });
});
