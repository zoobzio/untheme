import type { Kit } from "@untheme/kit";

import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { makeUntheme } from "untheme";
import { proveTheme } from "@untheme/testing";

import { ROOT, build, palette, syntax, syntaxDark, upstream } from "./helpers";

/**
 * The build of the theme, beside a build of aurora from the same package. The
 * theme is aurora with the `ramps` set extended by the palette, the `roles`
 * set extended by the `syntax-*` group, and the dark context extended by the
 * dark bindings of the group. The tests check that the palette is the base,
 * that the syntax group is the only addition, that everything else is
 * aurora's, and that every theme of aurora is a layer.
 */
let kit: Kit;
let aurora: Kit;
let ramps: Record<string, { $type: string; $value: { hex: string } }>;
let roles: Record<string, { $type: string; $value: string }>;
let dark: Record<string, { $type: string; $value: string }>;

/** The tokens of a document: its entries less the `$`-prefixed metadata. */
const tokensOf = (document: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(document).filter(([name]) => !name.startsWith("$")),
  ) as typeof ramps;

/** A record with each value replaced by `fn` of it. */
const map = <T, U>(record: Record<string, T>, fn: (value: T) => U) =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, fn(value)]),
  );

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
  roles = tokensOf(await syntax()) as unknown as typeof roles;
  dark = tokensOf(await syntaxDark()) as unknown as typeof dark;
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

  it("has the contract of aurora, plus the syntax group", () => {
    expect(Object.keys(kit.theme.tokens).sort()).toEqual(
      [...Object.keys(aurora.theme.tokens), ...Object.keys(roles)].sort(),
    );
    for (const [token, slot] of Object.entries(kit.theme.tokens)) {
      expect(slot.$type, token).toBe(
        aurora.theme.tokens[token]?.$type ?? roles[token]?.$type,
      );
    }
    expect(kit.theme.order).toEqual(aurora.theme.order);
    expect(kit.input).toEqual(aurora.input);
    expect(kit.manifest).toEqual(aurora.manifest);
  });

  it("binds the palette and the syntax group as authored and everything else as aurora does", () => {
    // Terrazzo normalizes a color it reads, so compare the hex of a ramp stop
    // rather than the whole value. A syntax role is a reference, which stays
    // the string it was authored as.
    for (const [token, slot] of Object.entries(kit.theme.tokens)) {
      const ours = ramps[token];
      const role = roles[token];
      if (ours) {
        expect((slot.$value as { hex: string }).hex, token).toBe(
          ours.$value.hex,
        );
      } else if (role) {
        expect(slot.$value, token).toBe(role.$value);
        expect(ramps, token).toHaveProperty(role.$value.slice(1, -1));
      } else {
        expect(slot.$value, token).toEqual(aurora.theme.tokens[token]?.$value);
      }
    }
  });

  it("keeps every context of aurora as it is, and the dark context rebinds the syntax group", () => {
    type Axes = Record<string, Record<string, Record<string, unknown>>>;
    const { color = {}, ...rest } = kit.theme.modifiers as Axes;
    const { color: theirs = {}, ...theirRest } = aurora.theme.modifiers as Axes;
    expect(rest).toEqual(theirRest);
    expect(Object.keys(color)).toEqual(Object.keys(theirs));
    for (const [context, bindings] of Object.entries(color)) {
      const added = Object.fromEntries(
        Object.entries(bindings).filter(([token]) => token in roles),
      );
      const kept = Object.fromEntries(
        Object.entries(bindings).filter(([token]) => !(token in roles)),
      );
      expect(kept, context).toEqual(theirs[context]);
      expect(added, context).toEqual(
        context === "dark" ? map(dark, (slot) => slot.$value) : {},
      );
    }
  });

  it("resolves the roles from the palette in each scheme", () => {
    expect(hex(kit, "primary")).toBe(ramps["primary-600"]!.$value.hex);
    expect(hex(kit, "primary")).not.toBe(hex(aurora, "primary"));
    const dark = { ...kit.input, color: "dark" };
    expect(hex({ ...kit, input: dark } as Kit, "primary")).toBe(
      ramps["primary-400"]!.$value.hex,
    );
  });

  it("resolves the syntax group from the palette in each scheme", () => {
    expect(hex(kit, "syntax-keyword")).toBe(ramps["primary-600"]!.$value.hex);
    const scheme = { ...kit.input, color: "dark" };
    expect(hex({ ...kit, input: scheme } as Kit, "syntax-keyword")).toBe(
      ramps["primary-400"]!.$value.hex,
    );
    for (const token of Object.keys(roles)) {
      expect(hex(kit, token), token).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("is sound at the boot selection and at each single-context change", () => {
    expect(() => proveTheme(kit.theme)).not.toThrow();
  });

  it("reads the palette and the syntax group as documents of the build", () => {
    expect(kit.documents).toContain(join(ROOT, "src/mantis.json"));
    expect(kit.documents).toContain(join(ROOT, "src/syntax.json"));
    expect(kit.documents).toContain(join(ROOT, "src/syntax-dark.json"));
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
