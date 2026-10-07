import type { Contract, Input } from "@untheme/schema";
import type { Kit } from "../src/types";

import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

import { makeUntheme } from "@untheme/core";

import { resolveKit } from "../src/resolve";

/**
 * Narrowed builds of aurora. Each test builds aurora under a `modifiers` config
 * and compares the result with a reference. The reference is aurora narrowed to
 * two themes. A full build costs a Terrazzo resolution per context, and the
 * theme axis has most of them. The reference keeps the comparisons and drops
 * that cost. The full build has its own file, `aurora.test.ts`, and the two
 * files run on separate workers.
 */
type Aurora = Contract<
  string,
  Record<string, Record<string, Record<string, never>>>
>;

/** The kit package. It is a project root whose packages include aurora. */
const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Aurora's resolver document, as a config source. */
const SOURCE = "npm:/@untheme/aurora/src/resolver.json";

/** Aurora at its default theme plus nord. Every other axis is complete. */
let reference: Kit;

beforeAll(async () => {
  reference = await resolveKit(
    { source: SOURCE, modifiers: { theme: { contexts: ["aurora", "nord"] } } },
    { cwd: ROOT },
  );
});

/** A service over the reference theme, at the defaults plus the given contexts. */
const boot = (input: Partial<Record<string, string>> = {}) => {
  return makeUntheme<Aurora>({
    theme: structuredClone(reference.theme) as Aurora,
    input: { ...reference.input, ...input } as Input<Aurora>,
    override: {},
  });
};

describe("a narrowed aurora build", () => {
  it("keeps every token and axis under a narrowed theme set", () => {
    expect(Object.keys(reference.theme.tokens)).toHaveLength(392);
    expect(Object.keys(reference.theme.modifiers.theme ?? {})).toEqual([
      "aurora",
      "nord",
    ]);
    expect(reference.input.theme).toBe("aurora");
  });

  it("keeps only the themes the config lists, booting the first", async () => {
    const narrowed = await resolveKit(
      {
        source: SOURCE,
        modifiers: { theme: { contexts: ["nord", "dracula"] } },
      },
      { cwd: ROOT },
    );
    expect(Object.keys(narrowed.theme.modifiers.theme ?? {})).toEqual([
      "nord",
      "dracula",
    ]);
    expect(narrowed.input).toEqual({ ...reference.input, theme: "nord" });
    expect(narrowed.theme.modifiers.theme?.nord).toEqual({});
    expect(Object.keys(narrowed.theme.tokens)).toEqual(
      Object.keys(reference.theme.tokens),
    );

    const ut = boot({ theme: "nord" });
    for (const [token, slot] of Object.entries(narrowed.theme.tokens)) {
      if (/-\d+$/.test(token)) {
        expect(slot.$value).toEqual(ut.resolve(token));
      } else {
        expect(slot).toEqual(reference.theme.tokens[token]);
      }
    }
    for (const modifier of reference.theme.order.slice(1)) {
      expect(narrowed.theme.modifiers[modifier]).toEqual(
        reference.theme.modifiers[modifier],
      );
    }
  });

  it("turns off an axis that shares its name with a set", async () => {
    const narrowed = await resolveKit(
      {
        source: SOURCE,
        modifiers: { theme: { contexts: ["aurora"] }, motion: false },
      },
      { cwd: ROOT },
    );
    expect(narrowed.theme.order).toEqual(
      reference.theme.order.filter((modifier) => modifier !== "motion"),
    );
    expect(narrowed.input).not.toHaveProperty("motion");
    expect(narrowed.theme.tokens).toEqual(reference.theme.tokens);
    expect(
      narrowed.documents.filter((path) =>
        /modifiers[\\/]theme[\\/]/.test(path),
      ),
    ).toHaveLength(1);
  });

  it("adds a theme from a token file of the project's own", async () => {
    const custom = await resolveKit(
      {
        source: SOURCE,
        modifiers: {
          theme: {
            add: {
              mine: "npm:/@untheme/aurora/src/modifiers/theme/nord.json",
            },
            contexts: ["aurora", "mine"],
          },
        },
      },
      { cwd: ROOT },
    );
    expect(Object.keys(custom.theme.modifiers.theme ?? {})).toEqual([
      "aurora",
      "mine",
    ]);
    expect(custom.theme.modifiers.theme?.mine).toEqual(
      reference.theme.modifiers.theme?.nord,
    );
  });
});
