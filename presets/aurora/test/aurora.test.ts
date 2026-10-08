import type { Kit } from "@untheme/kit";

import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

import { defineSchema } from "untheme";
import { proveTheme } from "@untheme/testing";

import { SRC, build, boot as bootKit } from "./helpers";

/**
 * The documents of the preset, built by the kit. A build checks the
 * structure: a valid contract, references that resolve, every context
 * verified against Terrazzo, and every theme checked against the contract as
 * a layer. The checks below cover what a build cannot detect: the channel
 * tokens ("channels") that the color, vibrancy, and contrast axes route
 * through, how those three axes resolve their collisions, and what a theme
 * rebinds.
 */
let kit: Kit;

/**
 * The authored dark color context, as written. The build drops an override
 * that equals the base value. For example, `outline-medium-contrast` steps to
 * the same stop in both modes. The test checks the dark context at its source.
 */
let authored: { color: { dark: Record<string, unknown> } };

/** A JSON document of the preset, by its path under `src/`. */
const read = async (path: string) =>
  JSON.parse(await readFile(new URL(path, SRC), "utf8"));

beforeAll(async () => {
  kit = await build();
  authored = { color: { dark: await read("modifiers/color/dark.json") } };
});

/** The modifier contexts of the built theme. */
const modifiers = () => kit.theme.modifiers;

/** A service over the built theme, at the defaults plus the given contexts. */
const boot = (selection: Partial<Record<string, string>> = {}) =>
  bootKit(kit, selection);

describe("the aurora build", () => {
  it("is a valid contract, booted at each modifier's default", () => {
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

  it("is sound at the boot selection and at each single-context change", () => {
    expect(() => proveTheme(kit.theme)).not.toThrow();
  });

  it("reads the resolver, every shared file, every context, and every theme", () => {
    const src = fileURLToPath(SRC);
    const files = kit.documents.map((path) =>
      relative(src, path).replace(/\\/g, "/"),
    );
    expect(files[0]).toBe("resolver.json");
    expect(files[1]).toBe("themes/aurora.json");
    expect(files.filter((file) => file.startsWith("tokens/"))).toHaveLength(17);
    expect(files.filter((file) => file.startsWith("themes/")).sort()).toEqual(
      kit.layers.map((built) => `themes/${built.entry.id}.json`).sort(),
    );
    for (const modifier of kit.theme.order) {
      expect(
        files
          .filter((file) => file.startsWith(`modifiers/${modifier}/`))
          .sort(),
      ).toEqual(
        Object.keys(modifiers()[modifier] ?? {})
          .map((context) => `modifiers/${modifier}/${context}.json`)
          .sort(),
      );
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

describe("the themes", () => {
  /** The built layer with an id. */
  const layer = (id: string) => {
    const built = kit.layers.find((item) => item.entry.id === id);
    if (built === undefined) {
      throw new Error(`no layer "${id}"`);
    }
    return built.layer;
  };

  it("are the thirty-one layers of the build, aurora among them", () => {
    expect(kit.layers.map((built) => built.entry.id)).toHaveLength(31);
    expect(kit.layers.map((built) => built.entry.id)).toContain("aurora");
    expect(kit.layers.map((built) => built.entry.id)).toContain("nord");
  });

  it("each hold the same 220 ramp stops, and nothing else", async () => {
    const names = (file: Record<string, unknown>) =>
      Object.keys(file).filter((key) => !key.startsWith("$"));

    const ramps = names(await read("themes/aurora.json"));
    expect(ramps).toHaveLength(220);
    for (const { entry, layer } of kit.layers) {
      expect(names(await read(`themes/${entry.id}.json`))).toEqual(ramps);
      const tokens = Object.keys(layer.tokens ?? {});
      expect(tokens).toHaveLength(220);
      for (const token of tokens) {
        expect(token).toMatch(/-\d+$/);
      }
    }
  });

  it("each pass the layer check of the contract", () => {
    const schema = defineSchema(kit.theme);
    for (const { layer } of kit.layers) {
      expect(schema.check.layer(layer)).toBe(true);
    }
  });

  it("start at the aurora palette, which is the base", () => {
    const ut = boot();
    const before = Object.fromEntries(
      Object.keys(layer("aurora").tokens ?? {}).map((token) => [
        token,
        ut.resolve(token),
      ]),
    );
    ut.apply(layer("aurora"));
    for (const [token, value] of Object.entries(before)) {
      expect(ut.resolve(token)).toEqual(value);
    }
    expect(ut.theme().id).toBe("aurora");
  });

  it("swap the palette under the roles, in either mode", async () => {
    const nord = await read("themes/nord.json");
    const ut = boot();
    expect(ut.get("primary")).toBe("{primary-600}");
    const before = ut.resolve("primary");
    ut.apply(layer("nord"));
    expect(ut.get("primary")).toBe("{primary-600}");
    expect(ut.resolve("primary")).not.toEqual(before);
    expect(ut.resolve("primary")).toMatchObject({
      hex: nord["primary-600"].$value.hex,
    });
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-200"));
    expect(ut.resolve("neutral-200")).toMatchObject({
      hex: nord["neutral-200"].$value.hex,
    });
  });

  it("are named and described from their own file", () => {
    for (const { entry } of kit.layers) {
      expect(entry.name).not.toBe("");
      expect(entry.description).toBeTypeOf("string");
    }
    expect(
      kit.layers.find((built) => built.entry.id === "catppuccin")?.entry,
    ).toEqual({
      id: "catppuccin",
      name: "Catppuccin Mocha",
      description: "Soothing lavender and blue pastels, from Catppuccin Mocha",
    });
  });
});

describe("the aurora manifest", () => {
  it("describes every axis, in order", () => {
    expect(kit.manifest.map((modifier) => modifier.id)).toEqual(
      kit.theme.order,
    );
    for (const modifier of kit.manifest) {
      expect(modifier.description).toBeTypeOf("string");
      expect(modifier.contexts.map((context) => context.id)).toEqual(
        Object.keys(modifiers()[modifier.id] ?? {}),
      );
    }
  });

  it("names and describes every context of every axis", () => {
    for (const modifier of kit.manifest) {
      for (const context of modifier.contexts) {
        expect(context.name).not.toBe("");
        expect(context.description).toBeTypeOf("string");
      }
    }
    const pick = (id: string) =>
      kit.manifest.find((modifier) => modifier.id === id);
    expect(pick("text")).toMatchObject({
      name: "Text size",
      contexts: [
        { id: "sm", name: "Small" },
        { id: "md", name: "Medium" },
        { id: "lg", name: "Large" },
      ],
    });
    expect(pick("density")?.contexts[1]).toEqual({
      id: "default",
      name: "Comfortable",
      description: "The spacing scale as designed.",
    });
  });
});
