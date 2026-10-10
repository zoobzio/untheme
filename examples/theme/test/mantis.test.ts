import type { Kit } from "@untheme/kit";

import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { makeUntheme } from "untheme";
import { proveTheme } from "@untheme/testing";

import { ROOT, build, palette, upstream } from "./helpers";

/**
 * The build of the theme, beside a build of aurora from the same package. The
 * theme is aurora with the `ramps` set extended by the palette. The tests
 * check that the palette is the base, that everything else is aurora's, and
 * that every theme of aurora is a layer.
 */
let kit: Kit;
let aurora: Kit;
let ramps: Record<string, { $type: string; $value: { hex: string } }>;

/** The tokens of a document: its entries less the `$`-prefixed metadata. */
const tokensOf = (document: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(document).filter(([name]) => !name.startsWith("$")),
  ) as typeof ramps;

/** The hex of a color token at a selection. */
const hex = (built: Kit, token: string, patch = {}) =>
  (
    makeUntheme(built.theme, { patch, input: built.input }).resolve(
      token as never,
    ) as { hex: string }
  ).hex;

beforeAll(async () => {
  [kit, aurora] = await Promise.all([build(), upstream()]);
  ramps = tokensOf(await palette());
});

describe("the palette", () => {
  it("defines exactly the ramp tokens of aurora", async () => {
    const theirs = tokensOf(
      JSON.parse(
        await import("node:fs/promises").then((fs) =>
          fs.readFile(
            join(ROOT, "node_modules/@untheme/aurora/src/themes/aurora.json"),
            "utf8",
          ),
        ),
      ),
    );
    expect(Object.keys(ramps)).toEqual(Object.keys(theirs));
    for (const [token, slot] of Object.entries(ramps)) {
      expect(slot.$type, token).toBe("color");
      expect(slot.$value.hex, token).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("the build", () => {
  it("carries the identity of the theme", () => {
    expect(kit.theme.id).toBe("mantis");
    expect(kit.theme.name).toBe("Mantis");
  });

  it("has the contract of aurora", () => {
    expect(Object.keys(kit.theme.tokens)).toEqual(
      Object.keys(aurora.theme.tokens),
    );
    for (const [token, slot] of Object.entries(kit.theme.tokens)) {
      expect(slot.$type, token).toBe(aurora.theme.tokens[token]?.$type);
    }
    expect(kit.theme.order).toEqual(aurora.theme.order);
    expect(kit.input).toEqual(aurora.input);
    expect(kit.manifest).toEqual(aurora.manifest);
  });

  it("binds the palette as authored and everything else as aurora does", () => {
    // Terrazzo normalizes a color it reads, so compare the hex of a ramp stop
    // rather than the whole value.
    for (const [token, slot] of Object.entries(kit.theme.tokens)) {
      const ours = ramps[token];
      if (ours) {
        expect((slot.$value as { hex: string }).hex, token).toBe(
          ours.$value.hex,
        );
      } else {
        expect(slot.$value, token).toEqual(aurora.theme.tokens[token]?.$value);
      }
    }
  });

  it("keeps every context of aurora as it is", () => {
    expect(kit.theme.modifiers).toEqual(aurora.theme.modifiers);
  });

  it("resolves the roles from the palette in each scheme", () => {
    expect(hex(kit, "primary")).toBe(ramps["primary-600"]!.$value.hex);
    expect(hex(kit, "primary")).not.toBe(hex(aurora, "primary"));
    const dark = { ...kit.input, color: "dark" };
    expect(hex({ ...kit, input: dark } as Kit, "primary")).toBe(
      ramps["primary-400"]!.$value.hex,
    );
  });

  it("is sound at the boot selection and at each single-context change", () => {
    expect(() => proveTheme(kit.theme)).not.toThrow();
  });

  it("reads the palette as a document of the build", () => {
    expect(kit.documents).toContain(join(ROOT, "src/mantis.json"));
  });

  it("is a preset: the resolver of the build references its own package", () => {
    expect(kit.resolver?.name).toBe("Mantis");
    expect(kit.resolver?.description).toMatch(/mantis shrimp/);
    const sets = kit.resolver!.sets as {
      ramps: { sources: { $ref: string }[] };
    };
    expect(sets.ramps.sources).toEqual([
      { $ref: "npm:/@untheme/aurora/src/themes/aurora.json" },
      { $ref: "npm:/@untheme/example-theme/src/mantis.json" },
    ]);
  });
});

describe("the layers", () => {
  it("are the base first, then every layer of aurora in its order", () => {
    const ids = kit.layers.map((built) => built.entry.id);
    expect(ids[0]).toBe("mantis");
    // Aurora lists its own base first, then its themes by name.
    expect(ids[1]).toBe("aurora");
    expect(ids.slice(2)).toEqual([...ids.slice(2)].sort());
    expect(ids).toHaveLength(32);
    expect(ids).toContain("nord");
  });

  it("hold what the config changed in the layer of the base", () => {
    // The layer of the base holds the stops that differ from aurora's. The
    // error, success, and warning seeds are aurora's, so those stops are not
    // in it, and applying the layer over any theme restores mantis.
    const mantis = kit.layers[0]!.layer;
    expect(mantis.name).toBe("Mantis");
    const changed = Object.entries(ramps)
      .filter(
        ([token, slot]) =>
          slot.$value.hex !==
          (aurora.theme.tokens[token]?.$value as { hex: string } | undefined)
            ?.hex,
      )
      .map(([token]) => token)
      .sort();
    expect(changed.length).toBeGreaterThan(0);
    expect(Object.keys(mantis.tokens ?? {}).sort()).toEqual(changed);
    for (const [token, value] of Object.entries(mantis.tokens ?? {})) {
      expect((value as { hex: string }).hex, token).toBe(
        ramps[token]?.$value.hex,
      );
    }
  });

  it("apply every theme of aurora, and the palette again", () => {
    const ut = makeUntheme(kit.theme, { patch: {}, input: kit.input });
    const own = hex(kit, "primary-600");
    for (const built of kit.layers.slice(1)) {
      ut.apply(built.layer);
      expect(ut.theme().id).toBe(built.entry.id);
      const stop = built.layer.tokens?.["primary-600"] as { hex: string };
      expect((ut.resolve("primary-600" as never) as { hex: string }).hex).toBe(
        stop.hex,
      );
    }
    ut.apply(kit.layers[0]!.layer);
    expect((ut.resolve("primary-600" as never) as { hex: string }).hex).toBe(
      own,
    );
  });
});
