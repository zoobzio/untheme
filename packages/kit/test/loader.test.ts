import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { installed, installedDirectory, loader } from "../src/loader";
import { FIXTURES } from "./helpers";

/**
 * A project root whose packages include `@acme/tokens`. The fixture project is
 * that package. Node resolves the name of a package through its own `exports`,
 * so an `npm:/@acme/tokens/` reference resolves from the root with no install.
 */
const ROOT = fileURLToPath(new URL("project/", FIXTURES));

describe("installed", () => {
  it("resolves an npm reference through the project's packages", () => {
    const path = installed(new URL("npm:/@acme/tokens/resolver.json"), ROOT);
    expect(path).toBe(
      fileURLToPath(new URL("project/resolver.json", FIXTURES)),
    );
  });

  it("ignores the JSON pointer of a reference", () => {
    const path = installed(
      new URL("npm:/@acme/tokens/tokens.json#/primary"),
      ROOT,
    );
    expect(path).toMatch(/project[\\/]tokens\.json$/);
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
      new URL("npm:/@acme/tokens/resolver.json"),
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
      load(new URL("npm:/@acme/tokens/resolver.json"), new URL("file:///")),
    ).resolves.toContain("resolutionOrder");
  });
});

describe("installedDirectory", () => {
  it("resolves a directory of the project when the project is the package", () => {
    expect(installedDirectory(new URL("npm:/@acme/tokens/themes"), ROOT)).toBe(
      fileURLToPath(new URL("project/themes", FIXTURES)),
    );
  });

  it("resolves a directory of an installed package from its node_modules", () => {
    const kit = fileURLToPath(new URL("../", import.meta.url));
    const path = installedDirectory(new URL("npm:/objectively/dist"), kit);
    expect(path).toMatch(/node_modules[\\/]objectively[\\/]dist$/);
  });

  it("names the package when none is installed", () => {
    expect(() =>
      installedDirectory(new URL("npm:/@untheme/missing/themes"), ROOT),
    ).toThrow(/"@untheme\/missing" is not an installed package/);
  });
});
