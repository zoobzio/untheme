import { describe, it, expect } from "vitest";
import { defineSchema } from "@untheme/schema";
import preset from "../src/preset";

import g10g90 from "../src/themes/g10-g90";
import g10g100 from "../src/themes/g10-g100";
import whiteg90 from "../src/themes/white-g90";

const themes = {
  "g10-g90": g10g90,
  "g10-g100": g10g100,
  "white-g90": whiteg90,
};

// The base scheme is its own contract; variants may not step outside it.
const schema = defineSchema(preset.use({ color: "light" }).theme);

describe("Carbon theme variants", () => {
  it("resolves every variant to a distinct id", () => {
    expect(
      Object.values(themes)
        .map((t) => t.id)
        .sort(),
    ).toEqual(Object.keys(themes).sort());
  });

  for (const [key, variant] of Object.entries(themes)) {
    describe(key, () => {
      it("carries an id matching its file name", () => {
        expect(variant.id).toBe(key);
      });

      it("resolves to a complete, contract-bound theme", () => {
        expect(schema.check.theme(variant)).toBe(true);
      });
    });
  }
});
