import { describe, it, expect } from "vitest";
import { generateCSS } from "../src/css";
import type { ThemeTemplate } from "../src/types";

const template: ThemeTemplate = {
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
  roles: {
    primary: "foreground",
  },
};

describe("generateCSS", () => {
  it("returns a string", () => {
    expect(typeof generateCSS(template)).toBe("string");
  });

  it("generates :root blocks", () => {
    const css = generateCSS(template);
    const roots = css.match(/:root \{/g);
    // one each for: reference, light, dark, roles
    expect(roots).toHaveLength(4);
  });

  it("outputs reference tokens as raw values", () => {
    const css = generateCSS(template);
    expect(css).toContain("--white: #ffffff");
    expect(css).toContain("--black: #000000");
  });

  it("wraps values that reference other tokens in var()", () => {
    const css = generateCSS(template);
    // "white" is a reference token key, so modes should wrap it
    expect(css).toContain("--background: var(--white)");
    expect(css).toContain("--foreground: var(--black)");
  });

  it("wraps role values that reference system tokens in var()", () => {
    const css = generateCSS(template);
    // "foreground" is a system token (in modes.dark), so roles should wrap it
    expect(css).toContain("--primary: var(--foreground)");
  });

  it("does not wrap values that are not token keys", () => {
    const raw: ThemeTemplate = {
      label: "raw",
      reference: { red: "#ff0000" },
      modes: {
        light: { accent: "#00ff00" },
        dark: { accent: "#00ff00" },
      },
      roles: { highlight: "#0000ff" },
    };
    const css = generateCSS(raw);
    // "#00ff00" and "#0000ff" are not token keys, should appear raw
    expect(css).toContain("--accent: #00ff00");
    expect(css).toContain("--highlight: #0000ff");
  });
});
