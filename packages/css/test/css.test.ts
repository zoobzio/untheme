import { describe, it, expect } from "vitest";
import { generateRootCSS } from "../src/index";

describe("generateRootCSS", () => {
  const tokens: Record<string, `{${string}}` | string> = {
    white: "#ffffff",
    black: "#000000",
    background: "{white}",
    foreground: "{black}",
    primary: "{foreground}",
  };

  it("returns a string", () => {
    expect(typeof generateRootCSS(tokens)).toBe("string");
  });

  it("generates a single :root block", () => {
    const css = generateRootCSS(tokens);
    const roots = css.match(/:root \{/g);
    expect(roots).toHaveLength(1);
  });

  it("outputs raw values for literals", () => {
    const css = generateRootCSS(tokens);
    expect(css).toContain("--white: #ffffff");
    expect(css).toContain("--black: #000000");
  });

  it("wraps {token} references in var()", () => {
    const css = generateRootCSS(tokens);
    expect(css).toContain("--background: var(--white)");
    expect(css).toContain("--foreground: var(--black)");
    expect(css).toContain("--primary: var(--foreground)");
  });

  it("does not wrap literal values", () => {
    const css = generateRootCSS({ accent: "#00ff00" });
    expect(css).toContain("--accent: #00ff00");
  });

  it("returns empty string for empty tokens", () => {
    expect(generateRootCSS({})).toBe("");
  });
});
