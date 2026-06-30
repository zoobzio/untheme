import { describe, it, expect } from "vitest";
import { defineSchema } from "@untheme/schema";
import preset from "../src/preset";

import blue from "../src/themes/blue";
import crimson from "../src/themes/crimson";
import cyan from "../src/themes/cyan";
import grass from "../src/themes/grass";
import orange from "../src/themes/orange";
import teal from "../src/themes/teal";

const themes = {
  blue,
  crimson,
  cyan,
  grass,
  orange,
  teal,
};

const { theme: base } = preset.use({ color: "light" });

/**
 * The base scheme is its own contract; variants may not step outside it.
 */
const schema = defineSchema(base);

describe("Radix theme variants", () => {
  it("derives every variant from the base", () => {
    for (const variant of Object.values(themes)) {
      expect(variant.name).toBeTruthy();
    }
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
