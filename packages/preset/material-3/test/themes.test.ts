import { describe, it, expect } from "vitest";
import themes from "../src/themes";

const entries = Object.entries(themes);

describe("M3 theme variants", () => {
  it("exports built variants", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  for (const [name, theme] of entries) {
    describe(name, () => {
      it("keys its variant under its own theme key", () => {
        expect(theme.key).toBe(name);
      });

      it("has matching light and dark system token keys", () => {
        expect(Object.keys(theme.modes.light).sort()).toEqual(
          Object.keys(theme.modes.dark).sort(),
        );
      });

      it("aliases only real reference tokens from every system token", () => {
        const refKeys = new Set(Object.keys(theme.reference));
        const aliases = [
          ...Object.values(theme.modes.light),
          ...Object.values(theme.modes.dark),
        ];
        for (const alias of aliases) {
          expect(refKeys.has(alias)).toBe(true);
        }
      });
    });
  }
});
