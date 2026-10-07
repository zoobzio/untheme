import type { Kit } from "@untheme/kit";

import { beforeAll, describe, expect, it } from "vitest";

import { resolveKit } from "@untheme/kit";
import { resolveAll } from "@untheme/testing";

import { ROOT, boot as bootKit } from "./helpers";

/**
 * Builds of part of the preset. Each test builds the preset under a
 * `modifiers` config and compares the result with a reference. The reference
 * is the preset narrowed to two themes. A full build costs a Terrazzo
 * resolution per context, and the theme axis has most of them. The reference
 * keeps the comparisons and drops that cost. The full build has its own file,
 * `aurora.test.ts`, and the two files run on separate workers.
 */

/** The resolver document, as the `source` of a kit config. */
const source = "./src/resolver.json";

/** The preset at its default theme plus nord. Every other axis is complete. */
let reference: Kit;

beforeAll(async () => {
  reference = await resolveKit(
    { source, modifiers: { theme: { contexts: ["aurora", "nord"] } } },
    { cwd: ROOT },
  );
});

/** A service over the reference theme, at the defaults plus the given contexts. */
const boot = (selection: Partial<Record<string, string>> = {}) =>
  bootKit(reference, selection);

describe("a build of part of the preset", () => {
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
      { source, modifiers: { theme: { contexts: ["nord", "dracula"] } } },
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

    /* The base is the nord palette. Every other token is as before. */
    const resolved = resolveAll(boot({ theme: "nord" }));
    for (const [token, slot] of Object.entries(narrowed.theme.tokens)) {
      if (/-\d+$/.test(token)) {
        expect(slot.$value).toEqual(resolved[token]);
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
        source,
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
        source,
        modifiers: {
          theme: {
            add: { mine: "./src/modifiers/theme/nord.json" },
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
