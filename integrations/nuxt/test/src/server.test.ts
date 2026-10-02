import type { EventHandler } from "h3";
import type { Entry, Listing, Page, Provider } from "untheme/catalog";

import { createApp, createRouter, toWebHandler } from "h3";
import { describe, it, expect, beforeEach } from "vitest";

import { defineClient } from "untheme/catalog";
import { defineSchema } from "untheme";

import { createThemeHandler, listEntries } from "../../src/server";
import { theme, themes } from "../fixtures";

/*
 * A manifest whose ids and names deliberately order differently — the id
 * `abyss` sorts first while its name `The Abyss` sorts last — so sort-field
 * assertions can tell the fields apart.
 */
const manifest: Entry[] = [
  { id: "nord", name: "Nord" },
  { id: "aurora", name: "Aurora" },
  { id: "midnight", name: "Midnight" },
  { id: "abyss", name: "The Abyss" },
];

/** The base the handler is mounted under, as a route file's folder would be. */
const BASE = "http://app.test/api/untheme";

/**
 * Serves a handler the way Nitro does for a catch-all route file at
 * `server/api/untheme/[...path].get.ts`: every request under the base reaches
 * it, and it reads the rest of the path itself.
 */
const serve = (handler: EventHandler) => {
  const app = createApp();
  app.use("/api/untheme", handler);
  const web = toWebHandler(app);
  return (path: string) => web(new Request(`${BASE}${path}`));
};

/** A JSON body, or the status of a failed response. */
const read = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    return { status: response.status };
  }
  return response.json();
};

/** The `q` param for a query. */
const q = (query: object) => `?q=${encodeURIComponent(JSON.stringify(query))}`;

describe("listEntries", () => {
  const all: Listing = {
    sort: { field: "name", direction: "asc" },
    limit: 20,
    offset: 0,
  };

  it("orders by name, ascending", () => {
    expect(listEntries(manifest, all).entries.map((entry) => entry.id)).toEqual(
      ["aurora", "midnight", "nord", "abyss"],
    );
  });

  it("filters by name, case-insensitively, with honest totals", () => {
    const page = listEntries(manifest, { ...all, search: "OR" });
    expect(page.entries.map((entry) => entry.id)).toEqual(["aurora", "nord"]);
    expect(page.total).toBe(2);
  });

  it("keeps the entries it is given untouched", () => {
    const before = structuredClone(manifest);
    listEntries(manifest, { ...all, sort: { field: "id", direction: "desc" } });
    expect(manifest).toEqual(before);
  });
});

describe("createThemeHandler", () => {
  let listings: Listing[];
  let request: (path: string) => Promise<Response>;

  const provider: Provider = {
    list: (listing) => {
      listings.push(listing);
      return listEntries(manifest, listing);
    },
    get: async (id) => themes[id],
  };

  beforeEach(() => {
    listings = [];
    request = serve(createThemeHandler(provider));
  });

  describe("the listing route", () => {
    it("lists the first page under the default window when no query is sent", async () => {
      const page = await read(await request("/themes"));
      expect(page).toEqual({
        entries: [
          { id: "aurora", name: "Aurora" },
          { id: "midnight", name: "Midnight" },
          { id: "nord", name: "Nord" },
          { id: "abyss", name: "The Abyss" },
        ],
        total: 4,
        limit: 20,
        offset: 0,
      });
      expect(listings).toEqual([
        { sort: { field: "name", direction: "asc" }, limit: 20, offset: 0 },
      ]);
    });

    it("hands the provider a normalized listing", async () => {
      await request(`/themes${q({ search: "OR" })}`);
      expect(listings).toEqual([
        {
          search: "OR",
          sort: { field: "name", direction: "asc" },
          limit: 20,
          offset: 0,
        },
      ]);
    });

    it("filters by name, case-insensitively, with honest totals", async () => {
      const page = (await read(
        await request(`/themes${q({ search: "OR" })}`),
      )) as Page;
      expect(page.entries).toEqual([
        { id: "aurora", name: "Aurora" },
        { id: "nord", name: "Nord" },
      ]);
      expect(page.total).toBe(2);
    });

    it("orders by the requested field and direction", async () => {
      const page = (await read(
        await request(
          `/themes${q({ sort: { field: "id", direction: "desc" } })}`,
        ),
      )) as Page;
      expect(page.entries.map((entry) => entry.id)).toEqual([
        "nord",
        "midnight",
        "aurora",
        "abyss",
      ]);
    });

    it("cuts the requested window and echoes it", async () => {
      const page = (await read(
        await request(`/themes${q({ limit: 2, offset: 1 })}`),
      )) as Page;
      expect(page.entries).toEqual([
        { id: "midnight", name: "Midnight" },
        { id: "nord", name: "Nord" },
      ]);
      expect(page.total).toBe(4);
      expect(page.limit).toBe(2);
      expect(page.offset).toBe(1);
    });

    it("answers on a trailing slash", async () => {
      expect((await request("/themes/")).status).toBe(200);
    });

    it("answers 400 when the query is not JSON", async () => {
      expect(await read(await request("/themes?q={not json"))).toEqual({
        status: 400,
      });
    });

    it("answers 400 when the query carries unknown fields", async () => {
      expect(await read(await request(`/themes${q({ bogus: true })}`))).toEqual(
        { status: 400 },
      );
    });

    it("answers 500 when the provider's page is malformed", async () => {
      const broken = serve(
        createThemeHandler({
          list: () => ({ entries: [{ id: "", name: 7 }] }),
          get: () => undefined,
        }),
      );
      expect(await read(await broken("/themes"))).toEqual({ status: 500 });
    });
  });

  describe("the retrieval route", () => {
    it("answers with the provider's layer for the id", async () => {
      expect(await read(await request("/themes/bravo"))).toEqual(themes.bravo);
    });

    it("decodes the id", async () => {
      const seen: string[] = [];
      const spy = serve(
        createThemeHandler({
          list: () => undefined,
          get: (id) => {
            seen.push(id);
            return themes.bravo;
          },
        }),
      );
      await spy(`/themes/${encodeURIComponent("night owl/2")}`);
      expect(seen).toEqual(["night owl/2"]);
    });

    it("answers 404 for a miss", async () => {
      expect(await read(await request("/themes/ghost"))).toEqual({
        status: 404,
      });
    });

    it("answers 404 for a null payload", async () => {
      const empty = serve(
        createThemeHandler({ list: () => undefined, get: () => null }),
      );
      expect(await read(await empty("/themes/bravo"))).toEqual({
        status: 404,
      });
    });

    it("answers 400 for an id that does not decode", async () => {
      expect(await read(await request("/themes/%E0%A4%A"))).toEqual({
        status: 400,
      });
    });
  });

  it("answers 404 off the wire protocol's paths", async () => {
    expect(await read(await request("/elsewhere"))).toEqual({ status: 404 });
    expect(await read(await request("/themes/bravo/extra"))).toEqual({
      status: 404,
    });
  });

  describe("in a catch-all route file", () => {
    /**
     * Serves the handler the way Nitro does for a catch-all route file under
     * `server/<base>/`: a router matches the base plus the catch-all, and the
     * handler reads the base off the matched route.
     */
    const route = (base: string, catchAll = "**:path") => {
      const app = createApp();
      const router = createRouter();
      router.get(`${base}/${catchAll}`, createThemeHandler(provider));
      app.use(router);
      const web = toWebHandler(app);
      return (path: string, under = base) =>
        web(new Request(`http://app.test${under}${path}`));
    };

    it("answers the listing and a layer below the base", async () => {
      const under = route("/api/untheme");
      const page = await read(await under("/themes"));
      expect(page).toMatchObject({ total: 4 });
      expect(await read(await under("/themes/charlie"))).toEqual(
        themes.charlie,
      );
    });

    it("decodes the id", async () => {
      const seen: string[] = [];
      const app = createApp();
      const router = createRouter();
      router.get(
        "/api/untheme/**:path",
        createThemeHandler({
          list: () => undefined,
          get: (id) => {
            seen.push(id);
            return themes.bravo;
          },
        }),
      );
      app.use(router);
      await toWebHandler(app)(
        new Request(`${BASE}/themes/${encodeURIComponent("night owl/2")}`),
      );
      expect(seen).toEqual(["night owl/2"]);
    });

    it("needs no name on the catch-all", async () => {
      const under = route("/api/untheme", "**");
      expect(await read(await under("/themes"))).toMatchObject({ total: 4 });
      expect(await read(await under("/themes/charlie"))).toEqual(
        themes.charlie,
      );
    });

    it("serves below a folder with a dynamic segment", async () => {
      const under = route("/api/:tenant/untheme", "**:slug");
      const at = "/api/acme/untheme";
      expect(await read(await under("/themes", at))).toMatchObject({
        total: 4,
      });
      expect(await read(await under("/themes/charlie", at))).toEqual(
        themes.charlie,
      );
    });

    it("answers the listing when the base itself ends in themes", async () => {
      const under = route("/api/themes");
      expect(await read(await under("/themes"))).toMatchObject({ total: 4 });
      expect(await read(await under("/themes/charlie"))).toEqual(
        themes.charlie,
      );
    });

    it("answers 404 off the wire protocol's paths", async () => {
      const under = route("/api/themes");
      expect(await read(await under("/elsewhere"))).toEqual({ status: 404 });
      expect(await read(await under("/themes/bravo/extra"))).toEqual({
        status: 404,
      });
    });
  });

  it("answers the listing on a prefix that itself ends in themes", async () => {
    const app = createApp();
    app.use("/api/themes", createThemeHandler(provider));
    const response = await toWebHandler(app)(
      new Request("http://app.test/api/themes/themes"),
    );
    expect(await read(response)).toMatchObject({ total: 4 });
  });

  it("speaks the protocol the catalog client reads", async () => {
    const schema = defineSchema(theme);
    const catalog = defineClient(schema, {
      base: "/api/untheme",
      fetch: (input, init) =>
        toWebHandler(
          createApp().use("/api/untheme", createThemeHandler(provider)),
        )(new Request(new URL(String(input), BASE), init)),
    });
    const page = await catalog.list({ search: "nord" });
    expect(page.entries).toEqual([{ id: "nord", name: "Nord" }]);
    await expect(catalog.get("charlie")).resolves.toEqual(themes.charlie);
    await expect(catalog.get("ghost")).resolves.toBeUndefined();
  });
});
