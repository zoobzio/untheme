import { describe, it, expect } from "vitest";

import { LIMIT, SORT } from "../src/constant";
import { defineClient } from "../src/client";
import {
  FailedRequestError,
  MalformedLayerError,
  MalformedPageError,
} from "../src/error";
import { corrupt, entries, midnight, page, schema } from "./fixture";

import type { T } from "./fixture";

/**
 * One captured request: the URL asked for and the init it was asked with.
 */
type Call = { url: string; init: RequestInit | undefined };

/**
 * A transport double: answers every request with the given body and
 * status, recording each call for assertions on the wire shape.
 */
const transport = (calls: Call[], body: unknown, status = 200) => {
  const fetch: typeof globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify(body), { status });
  };
  return fetch;
};

describe("the wire shape", () => {
  it("lists from {base}/themes with the listing JSON-encoded in one parameter", async () => {
    const calls: Call[] = [];
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test/api/",
      fetch: transport(calls, page),
    });
    await catalog.list({ search: "nord", limit: 2 });

    expect(calls).toHaveLength(1);
    const call = calls[0];
    if (call === undefined) {
      throw new Error("expected a captured call");
    }
    const url = new URL(call.url);
    expect(url.origin).toBe("https://themes.test");
    expect(url.pathname).toBe("/api/themes");
    const q = url.searchParams.get("q");
    expect(q).not.toBeNull();
    if (q) {
      expect(JSON.parse(q)).toEqual({
        search: "nord",
        sort: SORT,
        limit: 2,
        offset: 0,
      });
    }
  });

  it("retrieves from {base}/themes/{id}, encoding the id into the path", async () => {
    const calls: Call[] = [];
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport(calls, midnight),
    });
    await catalog.get("mid/night");
    expect(calls[0]?.url).toBe("https://themes.test/themes/mid%2Fnight");
  });

  it("sends the accept header and the configured headers on every request", async () => {
    const calls: Call[] = [];
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      headers: { authorization: "Bearer token" },
      fetch: transport(calls, page),
    });
    await catalog.list();
    expect(calls[0]?.init?.headers).toEqual({
      accept: "application/json",
      authorization: "Bearer token",
    });
  });
});

describe("list over the wire", () => {
  it("answers with the page the far end sent", async () => {
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport([], {
        entries: entries.slice(0, 2),
        total: entries.length,
        limit: 2,
        offset: 0,
      }),
    });
    const answered = await catalog.list({ limit: 2 });
    expect(answered.total).toBe(4);
    expect(answered.entries).toHaveLength(2);
    expect(answered.limit).toBe(2);
  });

  it("treats every failure status as a failure — a missing listing route is misconfiguration", async () => {
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport([], null, 404),
    });
    const failure = catalog.list();
    await expect(failure).rejects.toThrow(FailedRequestError);
    await failure.catch((error: FailedRequestError) => {
      expect(error.status).toBe(404);
      expect(error.url).toContain("https://themes.test/themes");
    });
  });

  it("proves the body is a page before answering", async () => {
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport([], { entries: "all of them" }),
    });
    await expect(catalog.list()).rejects.toThrow(MalformedPageError);
  });

  it("normalizes before the wire, so the far end never applies its own defaults", async () => {
    const calls: Call[] = [];
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport(calls, page),
    });
    await catalog.list();
    const call = calls[0];
    if (call === undefined) {
      throw new Error("expected a captured call");
    }
    const q = new URL(call.url).searchParams.get("q");
    expect(q).not.toBeNull();
    if (q) {
      expect(JSON.parse(q)).toEqual({ sort: SORT, limit: LIMIT, offset: 0 });
    }
  });
});

describe("get over the wire", () => {
  it("answers a hit with the layer, proven against the contract", async () => {
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport([], midnight),
    });
    await expect(catalog.get("midnight")).resolves.toEqual(midnight);
  });

  it("answers a 404 with a miss", async () => {
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport([], null, 404),
    });
    await expect(catalog.get("ghost")).resolves.toBeUndefined();
  });

  it("answers any other failure status with a failure", async () => {
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport([], null, 500),
    });
    await expect(catalog.get("midnight")).rejects.toThrow(FailedRequestError);
  });

  it("throws on a payload outside the contract instead of passing it as a miss", async () => {
    const catalog = defineClient<T>(schema, {
      base: "https://themes.test",
      fetch: transport([], corrupt),
    });
    await expect(catalog.get("corrupt")).rejects.toThrow(MalformedLayerError);
  });
});
