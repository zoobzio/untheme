import { describe, expect, it } from "vitest";

import { bootUntheme } from "../src/boot";
import { mockTheme } from "../src/theme";

const theme = mockTheme({
  tokens: {
    white: "#fff",
    black: "#000",
    surface: "{white}",
    "on-surface": "{black}",
  },
  modifiers: {
    color: {
      light: {},
      dark: { surface: "{black}", "on-surface": "{white}" },
    },
  },
});

describe("bootUntheme", () => {
  it("boots a service at the first context of each modifier", () => {
    const untheme = bootUntheme(theme);
    expect(untheme.config.input).toEqual({ color: "light" });
    expect(untheme.resolve("surface")).toMatchObject({ hex: "#ffffff" });
    expect(untheme.get("on-surface")).toBe("{black}");
  });

  it("boots at a pinned selection", () => {
    const untheme = bootUntheme(theme, { color: "dark" });
    expect(untheme.resolve("surface")).toMatchObject({ hex: "#000000" });
  });

  it("gives every call its own container over a detached theme", () => {
    const first = bootUntheme(theme);
    const second = bootUntheme(theme);
    first.swap("color", "dark");
    first.set("white", "#eee");
    expect(second.config.input).toEqual({ color: "light" });
    expect(second.dirty()).toBe(false);
    expect(first.schema.base).not.toBe(theme);
    expect(first.theme()).toBe(first.schema.base);
    expect(theme.tokens.white.$value).toMatchObject({ hex: "#ffffff" });
  });

  it("threads options through to the service", () => {
    const seen: string[] = [];
    const untheme = bootUntheme(
      theme,
      {},
      {
        get: {
          config: {
            input: (input) => {
              seen.push(input.color);
              return input;
            },
          },
        },
      },
    );
    untheme.resolve("surface");
    expect(seen).toContain("light");
  });
});
