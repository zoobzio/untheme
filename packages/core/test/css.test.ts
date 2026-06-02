import { describe, it, expect } from "vitest";
import { generateCSS } from "../src/css";
import type { Config } from "../src/types";

const template: Config<string, string> = {
  label: "test",
  reference: {
    white: "#ffffff",
    black: "#000000",
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
};

describe("generateCSS", () => {
  it("returns a string", () => {
    expect(typeof generateCSS(template)).toBe("string");
  });

  it("generates :root blocks for reference, light, and dark", () => {
    const css = generateCSS(template);
    const roots = css.match(/:root \{/g);
    expect(roots).toHaveLength(3);
  });

  it("outputs reference tokens as raw values", () => {
    const css = generateCSS(template);
    expect(css).toContain("--white: #ffffff");
    expect(css).toContain("--black: #000000");
  });

  it("wraps values that reference other tokens in var()", () => {
    const css = generateCSS(template);
    expect(css).toContain("--background: var(--white)");
    expect(css).toContain("--foreground: var(--black)");
  });

  it("does not wrap values that are not token keys", () => {
    const raw: Config<string, string> = {
      label: "raw",
      reference: { red: "#ff0000" },
      modes: {
        light: { accent: "#00ff00" },
        dark: { accent: "#00ff00" },
      },
    };
    const css = generateCSS(raw);
    expect(css).toContain("--accent: #00ff00");
  });

  it("generates an additional :root block for addon tokens", () => {
    const css = generateCSS(template, { primary: "foreground" });
    const roots = css.match(/:root \{/g);
    expect(roots).toHaveLength(4);
    expect(css).toContain("--primary: var(--foreground)");
  });

  it("does not generate addon block when addon is empty", () => {
    const css = generateCSS(template, {});
    const roots = css.match(/:root \{/g);
    expect(roots).toHaveLength(3);
  });
});
