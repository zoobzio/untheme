import type { Kit } from "@untheme/kit";

import { beforeAll, describe, expect, it } from "vitest";

import { resolveKit } from "@untheme/kit";

import { ROOT, build } from "./helpers";

/**
 * Builds of part of the preset. Each test builds the preset under a config
 * and compares the result with the full build.
 */

/** The resolver document, as the `source` of a kit config. */
const source = "./src/resolver.json";

/** The full build of the preset. */
let reference: Kit;

beforeAll(async () => {
  reference = await build();
});

describe("a build of part of the preset", () => {
  it("builds the contract with no theme files when the config has no layers", async () => {
    const bare = await resolveKit({ source }, { cwd: ROOT });
    expect(bare.theme).toEqual(reference.theme);
    expect(bare.input).toEqual(reference.input);
    // The base is always a layer. With no theme files, it is the only one, and
    // it has no tokens: applying it is the base.
    expect(bare.layers.map((built) => built.entry.id)).toEqual(["aurora"]);
    expect(bare.layers[0]?.layer).toEqual({ id: "aurora", name: "Aurora" });
    expect(bare.documents.filter((path) => /themes[\\/]/.test(path))).toEqual([
      reference.documents[1],
    ]);
  });

  it("builds only the layers the config names", async () => {
    const two = await resolveKit(
      {
        source,
        layers: {
          nord: "./src/themes/nord.json",
          dracula: "./src/themes/dracula.json",
        },
      },
      { cwd: ROOT },
    );
    expect(two.layers.map((built) => built.entry.id)).toEqual([
      "aurora",
      "nord",
      "dracula",
    ]);
    expect(two.layers[1]).toEqual(
      reference.layers.find((built) => built.entry.id === "nord"),
    );
    expect(
      two.documents.filter((path) => /themes[\\/]/.test(path)),
    ).toHaveLength(3);
  });

  it("turns off an axis and keeps the rest", async () => {
    const narrowed = await resolveKit(
      { source, modifiers: { motion: false } },
      { cwd: ROOT },
    );
    expect(narrowed.theme.order).toEqual(
      reference.theme.order.filter((modifier) => modifier !== "motion"),
    );
    expect(narrowed.input).not.toHaveProperty("motion");
    expect(narrowed.theme.tokens).toEqual(reference.theme.tokens);
  });

  it("adds a context to an axis from a token file of the project's own", async () => {
    const custom = await resolveKit(
      {
        source,
        modifiers: {
          density: {
            add: { tight: "./src/modifiers/density/compact.json" },
            contexts: ["default", "tight"],
          },
        },
      },
      { cwd: ROOT },
    );
    expect(Object.keys(custom.theme.modifiers.density ?? {})).toEqual([
      "default",
      "tight",
    ]);
    expect(custom.theme.modifiers.density?.tight).toEqual(
      reference.theme.modifiers.density?.compact,
    );
  });

  it("builds a layer of the project's own against the contract", async () => {
    const custom = await resolveKit(
      { source, layers: { mine: "./src/themes/nord.json" } },
      { cwd: ROOT },
    );
    expect(custom.layers[1]?.layer).toEqual({
      ...reference.layers.find((built) => built.entry.id === "nord")?.layer,
      id: "mine",
    });
  });
});
