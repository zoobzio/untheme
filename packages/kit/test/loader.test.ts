import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { installed, loader } from "../src/loader";
import { FIXTURES } from "./helpers";

/** The kit package itself: a project root whose packages include aurora. */
const ROOT = fileURLToPath(new URL("..", import.meta.url));

describe("installed", () => {
  it("resolves an npm reference through the project's packages", () => {
    const path = installed(
      new URL("npm:/@untheme/aurora/aurora.resolver.json"),
      ROOT,
    );
    expect(path).toMatch(/aurora[\\/]aurora\.resolver\.json$/);
  });

  it("ignores the JSON pointer of a reference", () => {
    const path = installed(
      new URL("npm:/@untheme/aurora/modifiers/contrast.json#/high"),
      ROOT,
    );
    expect(path).toMatch(/modifiers[\\/]contrast\.json$/);
  });

  it("names the reference when no installed package exports it", () => {
    expect(() =>
      installed(new URL("npm:/@untheme/missing/tokens.json"), ROOT),
    ).toThrow(/npm:\/@untheme\/missing\/tokens\.json/);
  });
});

describe("loader", () => {
  it("reads npm references off disk and records them", async () => {
    const { load, documents } = loader(ROOT);
    const src = await load(
      new URL("npm:/@untheme/aurora/aurora.resolver.json"),
      new URL("file:///"),
    );
    expect(JSON.parse(src)).toHaveProperty("resolutionOrder");
    expect(documents).toHaveLength(1);
  });

  it("hands file and remote documents to the caller's req", async () => {
    const seen: string[] = [];
    const { load, documents } = loader(ROOT, async (src) => {
      seen.push(src.href);
      return "{}";
    });
    await load(new URL("base.json", FIXTURES), FIXTURES);
    await load(new URL("https://cdn.test/x.json"), FIXTURES);
    await load(new URL("base.json", FIXTURES), FIXTURES);
    expect(seen).toEqual([
      new URL("base.json", FIXTURES).href,
      "https://cdn.test/x.json",
      new URL("base.json", FIXTURES).href,
    ]);
    expect(documents).toEqual([fileURLToPath(new URL("base.json", FIXTURES))]);
  });

  it("never hands an npm reference to the caller's req", async () => {
    const { load } = loader(ROOT, async () => {
      throw new Error("req called");
    });
    await expect(
      load(
        new URL("npm:/@untheme/aurora/aurora.resolver.json"),
        new URL("file:///"),
      ),
    ).resolves.toContain("resolutionOrder");
  });
});
