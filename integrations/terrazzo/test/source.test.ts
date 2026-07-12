import { afterEach, describe, expect, it, vi } from "vitest";

import { identify, identity, locate, request, workspace } from "../src/source";
import { FIXTURES, load } from "./helpers";

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

describe("workspace", () => {
  it("is the working directory as a trailing-slash file URL", async () => {
    const ws = await workspace();
    expect(ws.protocol).toBe("file:");
    expect(ws.href.endsWith("/")).toBe(true);
  });
});

describe("identity", () => {
  it("slugs an explicit name into an id", () => {
    expect(identity({ name: "Dark Ocean" }, undefined)).toEqual({
      id: "dark-ocean",
      name: "Dark Ocean",
    });
  });

  it("lets an explicit id override the slug", () => {
    expect(identity({ id: "ocean", name: "Dark Ocean" }, undefined)).toEqual({
      id: "ocean",
      name: "Dark Ocean",
    });
  });

  it("falls back to the resolver document's own name", async () => {
    const { parsed } = await load("resolver.json");
    expect(identity({}, parsed.resolver)).toEqual({
      id: "fixture",
      name: "Fixture",
    });
  });

  it("suppresses the synthetic bridge name of a plain token document", async () => {
    const { parsed } = await load("base.json");

    /* A plain document parses to a synthetic tzMode resolver that still
       carries Terrazzo's own name; identity must not adopt it. */
    expect(parsed.resolver?.source.name).toBeDefined();
    expect(() => identity({}, parsed.resolver)).toThrow(/no theme identity/);
    expect(identity({ name: "Base" }, parsed.resolver)).toEqual({
      id: "base",
      name: "Base",
    });
  });

  it("throws when no name is available", () => {
    expect(() => identity({}, undefined)).toThrow(/no theme identity/);
  });

  it("throws when the name slugs to an empty id", () => {
    expect(() => identity({ name: "!!!" }, undefined)).toThrow(
      /slugs to an empty id/,
    );
  });
});

describe("identify", () => {
  const url = new URL("file:///themes/dark-ocean.json");

  it("uses the entry's own id and name when present", () => {
    expect(identify({ id: "ocean", name: "Ocean" }, url)).toEqual({
      id: "ocean",
      name: "Ocean",
    });
  });

  it("defaults the name to the id when only an id is given", () => {
    expect(identify({ id: "ocean" }, url)).toEqual({
      id: "ocean",
      name: "ocean",
    });
  });

  it("derives the id from the filename when the entry has none", () => {
    expect(identify({}, url)).toEqual({
      id: "dark-ocean",
      name: "dark-ocean",
    });
  });

  it("keeps an explicit name while deriving the id from the filename", () => {
    expect(identify({ name: "Ocean" }, url)).toEqual({
      id: "dark-ocean",
      name: "Ocean",
    });
  });

  it("throws when no id can be derived from the url", () => {
    expect(() => identify({}, new URL("file:///themes/"))).toThrow(
      /cannot derive an id/,
    );
  });
});
