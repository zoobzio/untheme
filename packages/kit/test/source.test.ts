import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  directory,
  installed,
  loader,
  locate,
  request,
  slashed,
  unslash,
} from "../src/source";
import { FIXTURES } from "./helpers";

/**
 * A project root whose packages include `@acme/tokens`. The fixture project is
 * that package. Node resolves the name of a package through its own `exports`,
 * so an `npm:/@acme/tokens/` reference resolves from the root with no install.
 */
const ROOT = fileURLToPath(new URL("project/", FIXTURES));

describe("locate", () => {
  const base = new URL("https://example.com/tokens/");

  it("resolves a relative string against the base", () => {
    expect(locate("./palette.json", base).href).toBe(
      "https://example.com/tokens/palette.json",
    );
  });

  it("keeps an absolute URL string absolute", () => {
    expect(locate("https://cdn.test/x.json", base).href).toBe(
      "https://cdn.test/x.json",
    );
  });

  it("keeps an npm reference absolute, and relative paths inside it resolve", () => {
    const url = locate("npm:/@untheme/aurora/src/resolver.json", base);
    expect(url.href).toBe("npm:/@untheme/aurora/src/resolver.json");
    expect(new URL("./tokens/space.json", url).href).toBe(
      "npm:/@untheme/aurora/src/tokens/space.json",
    );
  });

  it("passes a URL through untouched", () => {
    const url = new URL("https://cdn.test/x.json");
    expect(locate(url, base)).toBe(url);
  });
});

describe("request", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads a file URL off disk", async () => {
    const src = await request(new URL("base.json", FIXTURES));
    expect(src).toContain('"colorSpace"');
  });

  it("throws with status and url when a fetch is not ok", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
    }));

    await expect(
      request(new URL("https://cdn.test/missing.json")),
    ).rejects.toThrow(/404 Not Found.*missing\.json|missing\.json.*404/);
  });
});

describe("unslash", () => {
  it("strips leading and trailing slashes and keeps inner ones", () => {
    expect(unslash("///@scope/pkg///")).toBe("@scope/pkg");
    expect(unslash("a/b")).toBe("a/b");
    expect(unslash("")).toBe("");
    expect(unslash("////")).toBe("");
  });

  it("stays linear on a long run of slashes", () => {
    const text = `${"/".repeat(100_000)}a`;
    const start = performance.now();
    expect(unslash(text)).toBe("a");
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe("slashed", () => {
  it("ends the URL with exactly one slash", () => {
    expect(slashed(new URL("https://cdn.test/a")).href).toBe(
      "https://cdn.test/a/",
    );
    expect(slashed(new URL("https://cdn.test/a///")).href).toBe(
      "https://cdn.test/a/",
    );
    expect(slashed(new URL("npm:/@untheme/aurora")).href).toBe(
      "npm:/@untheme/aurora/",
    );
  });
});

describe("directory", () => {
  it("is the path as a trailing-slash file URL", () => {
    const url = directory("/projects/app");
    expect(url.href).toBe("file:///projects/app/");
  });
});

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
