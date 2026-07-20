import type { Listing } from "../src/types";

import { describe, it, expect } from "vitest";

import { LIMIT, SORT } from "../src/constant";
import {
  MalformedLayerError,
  MalformedPageError,
  MalformedQueryError,
} from "../src/error";
import { defineCatalog } from "../src/catalog";
import { answer, corrupt, midnight, schema } from "./fixture";

import type { T } from "./fixture";

/**
 * A well-behaved in-memory source: listings through the reference
 * evaluator, retrievals from a record, synchronous throughout to prove the
 * catalog accepts bare values as well as promises.
 */
const source = {
  list: (listing: Listing) => answer(listing),
  get: (id: string) => {
    if (id === "midnight") {
      return midnight;
    }
    if (id === "corrupt") {
      return corrupt;
    }
    return undefined;
  },
};

describe("list", () => {
  it("answers a query through the source", async () => {
    const catalog = defineCatalog<T>(schema, source);
    const page = await catalog.list({ search: "mid" });
    expect(page.entries.map((entry) => entry.id)).toEqual(["midnight"]);
    expect(page.total).toBe(1);
  });

  it("normalizes before the source sees the query", async () => {
    const listings: Listing[] = [];
    const catalog = defineCatalog<T>(schema, {
      ...source,
      list: (listing) => {
        listings.push(listing);
        return answer(listing);
      },
    });
    await catalog.list();
    expect(listings).toEqual([{ sort: SORT, limit: LIMIT, offset: 0 }]);
  });

  it("rejects a value that is not a query", async () => {
    const catalog = defineCatalog<T>(schema, source);
    const junk: unknown[] = [{ ghost: true }, "nord", { limit: -1 }];
    for (const value of junk) {
      await expect(
        Reflect.apply(catalog.list, undefined, [value]),
      ).rejects.toThrow(MalformedQueryError);
    }
  });

  it("rejects a source answer that is not a page", async () => {
    const catalog = defineCatalog<T>(schema, {
      ...source,
      list: () => ({ entries: "all of them" }),
    });
    await expect(catalog.list()).rejects.toThrow(MalformedPageError);
  });

  it("accepts a source answering behind a promise", async () => {
    const catalog = defineCatalog<T>(schema, {
      ...source,
      list: async (listing) => answer(listing),
    });
    const page = await catalog.list();
    expect(page.total).toBe(4);
  });
});

describe("get", () => {
  it("answers a hit with the layer, proven against the contract", async () => {
    const catalog = defineCatalog<T>(schema, source);
    await expect(catalog.get("midnight")).resolves.toEqual(midnight);
  });

  it("answers a miss with undefined, for null and undefined alike", async () => {
    const catalog = defineCatalog<T>(schema, source);
    await expect(catalog.get("ghost")).resolves.toBeUndefined();
    const nullish = defineCatalog<T>(schema, { ...source, get: () => null });
    await expect(nullish.get("ghost")).resolves.toBeUndefined();
  });

  it("throws on a payload outside the contract instead of passing it as a miss", async () => {
    const catalog = defineCatalog<T>(schema, source);
    const failure = catalog.get("corrupt");
    await expect(failure).rejects.toThrow(MalformedLayerError);
    await failure.catch((error: MalformedLayerError) => {
      expect(error.id).toBe("corrupt");
      expect(error.issues.length).toBeGreaterThan(0);
    });
  });

  it("accepts a source answering behind a promise", async () => {
    const catalog = defineCatalog<T>(schema, {
      ...source,
      get: async () => midnight,
    });
    await expect(catalog.get("midnight")).resolves.toEqual(midnight);
  });
});
