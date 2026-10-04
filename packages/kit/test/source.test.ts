import { afterEach, describe, expect, it, vi } from "vitest";

import { directory, locate, request } from "../src/source";
import { FIXTURES } from "./helpers";

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

describe("directory", () => {
  it("is the path as a trailing-slash file URL", () => {
    const url = directory("/projects/app");
    expect(url.href).toBe("file:///projects/app/");
  });
});
