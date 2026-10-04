import type { Contract, Input } from "@untheme/schema";
import type { Kit } from "../src/types";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

import { makeUntheme } from "@untheme/core";
import { defineSchema } from "@untheme/schema";

import { resolveKit } from "../src/resolve";

/**
 * Aurora is the kit's fixture: it ships only DTCG JSON, so building it here
 * proves the structure — a valid contract, references that resolve, every
 * context proven against Terrazzo. The checks below cover what a build cannot
 * detect: the channel tokens ("channels") the color, vibrancy and contrast
 * axes route through, and how those three axes resolve their collisions.
 */
type Aurora = Contract<
  string,
  Record<string, Record<string, Record<string, never>>>
>;

/** The kit package — a project root whose packages include aurora. */
const ROOT = fileURLToPath(new URL("..", import.meta.url));

let kit: Kit;

/**
 * Aurora's authored color modifier file, as written. The build drops an
 * override equal to the base value (`outline-medium-contrast` steps to the
 * same stop in both modes), so the dark context is checked at its source.
 */
let authored: { color: { dark: Record<string, unknown> } };

beforeAll(async () => {
  kit = await resolveKit(
    { source: "npm:/@untheme/aurora/themes/aurora/resolver.json" },
    { cwd: ROOT },
  );
  const path = createRequire(import.meta.url).resolve(
    "@untheme/aurora/modifiers/color.json",
  );
  authored = { color: JSON.parse(await readFile(path, "utf8")) };
});

/** The modifier contexts of the built theme. */
const modifiers = () => kit.theme.modifiers;

/** A service over the built theme, at the defaults plus the given contexts. */
const boot = (input: Partial<Record<string, string>> = {}) => {
  return makeUntheme<Aurora>({
    theme: structuredClone(kit.theme) as Aurora,
    input: { ...kit.input, ...input } as Input<Aurora>,
    override: {},
  });
};

describe("the aurora build", () => {
  it("is a valid contract, booted at each modifier's default", () => {
    const schema = defineSchema(kit.theme);
    expect(() => schema.assert.theme(kit.theme)).not.toThrow();
    expect(kit.theme.id).toBe("aurora");
    expect(kit.theme.name).toBe("Aurora");
    expect(Object.keys(kit.theme.tokens)).toHaveLength(392);
    expect(kit.input).toEqual({
      color: "light",
      vibrancy: "balanced",
      contrast: "default",
      text: "md",
      density: "default",
      radius: "default",
      depth: "default",
      motion: "default",
    });
  });

  it("reads the resolver, its color files, and every shared file", () => {
    const files = kit.documents.map((path) =>
      path.replace(/\\/g, "/").replace(/^.*?\/aurora\//, ""),
    );
    expect(files[0]).toBe("themes/aurora/resolver.json");
    expect(
      files.filter((file) => file.startsWith("themes/aurora/colors/")),
    ).toHaveLength(8);
    expect(files.filter((file) => file.startsWith("tokens/"))).toHaveLength(17);
    expect(files.filter((file) => file.startsWith("modifiers/"))).toEqual(
      kit.theme.order.map((modifier) => `modifiers/${modifier}.json`),
    );
  });

  it("resolves every token at the defaults", () => {
    const ut = boot();
    for (const token of Object.keys(kit.theme.tokens)) {
      expect(() => ut.resolve(token)).not.toThrow();
    }
  });

  it("resolves vibrancy after color, and contrast after vibrancy", () => {
    const { order } = kit.theme;
    expect(order.indexOf("vibrancy")).toBeGreaterThan(order.indexOf("color"));
    expect(order.indexOf("contrast")).toBeGreaterThan(
      order.indexOf("vibrancy"),
    );
  });
});

describe("vibrancy channels", () => {
  const levels = ["muted", "vivid"] as const;

  it("re-points every accent role at its own channel token", () => {
    for (const level of levels) {
      const context = modifiers().vibrancy?.[level] ?? {};
      expect(Object.keys(context).length).toBeGreaterThan(0);
      for (const [role, binding] of Object.entries(context)) {
        expect(binding).toBe(`{${role}-${level}}`);
      }
    }
  });

  it("defines every channel a vibrancy override targets", () => {
    for (const level of levels) {
      for (const role of Object.keys(modifiers().vibrancy?.[level] ?? {})) {
        expect(kit.theme.tokens).toHaveProperty([`${role}-${level}`]);
      }
    }
  });

  it("rebinds every channel in the dark context", () => {
    for (const level of levels) {
      for (const role of Object.keys(modifiers().vibrancy?.[level] ?? {})) {
        expect(authored.color.dark).toHaveProperty([`${role}-${level}`]);
      }
    }
  });

  it("shifts the same role set at both vibrancy levels", () => {
    expect(Object.keys(modifiers().vibrancy?.muted ?? {}).sort()).toEqual(
      Object.keys(modifiers().vibrancy?.vivid ?? {}).sort(),
    );
  });
});

describe("contrast channels", () => {
  const levels = ["medium", "high"] as const;

  it("re-points every shifted role at its own channel token", () => {
    for (const level of levels) {
      const context = modifiers().contrast?.[level] ?? {};
      expect(Object.keys(context).length).toBeGreaterThan(0);
      for (const [role, binding] of Object.entries(context)) {
        expect(binding).toBe(`{${role}-${level}-contrast}`);
      }
    }
  });

  it("defines every channel a contrast override targets", () => {
    for (const level of levels) {
      for (const role of Object.keys(modifiers().contrast?.[level] ?? {})) {
        expect(kit.theme.tokens).toHaveProperty([`${role}-${level}-contrast`]);
      }
    }
  });

  it("rebinds every channel in the dark context", () => {
    for (const level of levels) {
      for (const role of Object.keys(modifiers().contrast?.[level] ?? {})) {
        expect(authored.color.dark).toHaveProperty([
          `${role}-${level}-contrast`,
        ]);
      }
    }
  });

  it("shifts the same role set at both contrast levels", () => {
    expect(Object.keys(modifiers().contrast?.medium ?? {}).sort()).toEqual(
      Object.keys(modifiers().contrast?.high ?? {}).sort(),
    );
  });
});

describe("the color axis", () => {
  it("rebinds the surface roles between modes", () => {
    const ut = boot();
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-800"));
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-200"));
  });
});

describe("the vibrancy axis", () => {
  it("re-points accent roles at their chroma column", () => {
    const ut = boot({ vibrancy: "muted" });
    expect(ut.get("primary")).toBe("{primary-muted}");
    expect(ut.get("primary-muted")).toBe("{primary-muted-600}");
    expect(ut.resolve("primary")).toEqual(ut.resolve("primary-muted-600"));
  });

  it("steps through the mode's channel in dark", () => {
    const ut = boot({ color: "dark", vibrancy: "vivid" });
    expect(ut.get("primary-vivid")).toBe("{primary-vivid-400}");
    expect(ut.resolve("primary")).toEqual(ut.resolve("primary-vivid-400"));
  });

  it("loses its collisions to contrast, so accessibility wins", () => {
    const ut = boot({ vibrancy: "vivid", contrast: "high" });
    expect(ut.get("primary")).toBe("{primary-high-contrast}");
  });
});

describe("the contrast axis", () => {
  it("pushes light mode toward the dark end of the ramp", () => {
    const ut = boot({ contrast: "high" });
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-950"));
  });

  it("pushes dark mode toward the light end through the same override", () => {
    const ut = boot({ color: "dark", contrast: "high" });
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-50"));
  });

  it("steps through the mode's channel token", () => {
    const ut = boot({ color: "dark", contrast: "medium" });
    expect(ut.get("on-surface")).toBe("{on-surface-medium-contrast}");
    expect(ut.get("on-surface-medium-contrast")).toBe("{neutral-100}");
  });
});

describe("the aurora themes", () => {
  const require = createRequire(import.meta.url);

  /** A JSON file of the aurora package, by its package path. */
  const read = async (path: string) => {
    const file = require.resolve(`@untheme/aurora/${path}`);
    return JSON.parse(await readFile(file, "utf8"));
  };

  /** A theme built from its own resolver document. */
  const build = (id: string) => {
    return resolveKit(
      { source: `npm:/@untheme/aurora/themes/${id}/resolver.json` },
      { cwd: ROOT },
    );
  };

  it("ships every theme as the same resolver over its own ramps", async () => {
    const shared = await read("themes/aurora/resolver.json");
    const ramps = async (id: string) => {
      const names: string[] = [];
      for (const { $ref } of shared.sets.colors.sources) {
        const file = await read(`themes/${id}/${$ref.replace("./", "")}`);
        names.push(...Object.keys(file));
      }
      return names;
    };
    const tokens = await ramps("aurora");
    expect(tokens).toHaveLength(220);

    const manifest: { id: string; name: string; description: string }[] =
      await read("index.json");
    expect(manifest).toHaveLength(31);
    for (const { id, name, description } of manifest) {
      expect(await read(`themes/${id}/resolver.json`)).toEqual({
        ...shared,
        name,
        description,
      });
      expect(await ramps(id)).toEqual(tokens);
    }
  });

  it("builds a theme to the same contract, rebinding only its ramps", async () => {
    const nord = await build("nord");
    expect(nord.theme.id).toBe("nord");
    expect(nord.theme.name).toBe("Nord");
    expect(nord.input).toEqual(kit.input);
    expect(nord.theme.order).toEqual(kit.theme.order);
    expect(nord.theme.modifiers).toEqual(kit.theme.modifiers);
    expect(Object.keys(nord.theme.tokens)).toEqual(
      Object.keys(kit.theme.tokens),
    );
    for (const [token, slot] of Object.entries(nord.theme.tokens)) {
      if (!/-\d+$/.test(token)) {
        expect(slot).toEqual(kit.theme.tokens[token]);
      }
    }
    expect(nord.theme.tokens["primary-500"]).not.toEqual(
      kit.theme.tokens["primary-500"],
    );
  });
});
