import { describe, it, expect } from "vitest";
import { generateCSS } from "../src/index";

describe("generateCSS", () => {
  const tokens: Record<string, string> = {
    white: "#ffffff",
    black: "#000000",
    background: "white",
    foreground: "black",
    primary: "foreground",
  };

  it("returns a string", () => {
    expect(typeof generateCSS(tokens)).toBe("string");
  });

  it("generates a single :root block", () => {
    const css = generateCSS(tokens);
    const roots = css.match(/:root \{/g);
    expect(roots).toHaveLength(1);
  });

  it("outputs raw values for tokens that are not keys", () => {
    const css = generateCSS(tokens);
    expect(css).toContain("--white: #ffffff");
    expect(css).toContain("--black: #000000");
  });

  it("wraps values that reference other token keys in var()", () => {
    const css = generateCSS(tokens);
    expect(css).toContain("--background: var(--white)");
    expect(css).toContain("--foreground: var(--black)");
    expect(css).toContain("--primary: var(--foreground)");
  });

  it("does not wrap values that are not token keys", () => {
    const css = generateCSS({ accent: "#00ff00" });
    expect(css).toContain("--accent: #00ff00");
  });

  it("returns empty string for empty tokens", () => {
    expect(generateCSS({})).toBe("");
  });
});
