import type { Page } from "untheme/catalog";

import { describe, it, expect, vi, beforeEach } from "vitest";

/*
 * The storage the mocked `useStorage` answers from: keys are asset names,
 * values whatever the test plants there.
 */
let assets: Record<string, unknown>;

vi.mock("h3", () => ({
  defineEventHandler: (handler: unknown) => handler,
  getQuery: (event: { query?: Record<string, unknown> }) => event.query ?? {},
  createError: (input: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}));

vi.mock("nitropack/runtime", () => ({
  useStorage: () => ({
    getItem: (key: string) => Promise.resolve(assets[key] ?? null),
  }),
}));

import handler from "../../../src/runtime/server/list";

type ListRoute = (event: { query?: Record<string, unknown> }) => Promise<Page>;
const list = handler as unknown as ListRoute;

/*
 * A manifest whose ids and names deliberately order differently — the id
 * `abyss` sorts first while its name `The Abyss` sorts last — so sort-field
 * assertions can tell the fields apart.
 */
const manifest = [
  { id: "nord", name: "Nord" },
  { id: "aurora", name: "Aurora" },
  { id: "midnight", name: "Midnight" },
  { id: "abyss", name: "The Abyss" },
];

describe("catalog listing route", () => {
  beforeEach(() => {
    assets = { "entries.json": manifest };
  });

  it("lists the first page under the default window when no query is sent", async () => {
    const page = await list({});
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
  });

  it("filters by name, case-insensitively, with honest totals", async () => {
    const page = await list({
      query: { q: JSON.stringify({ search: "OR" }) },
    });
    expect(page.entries).toEqual([
      { id: "aurora", name: "Aurora" },
      { id: "nord", name: "Nord" },
    ]);
    expect(page.total).toBe(2);
  });

  it("orders by the requested field and direction", async () => {
    const page = await list({
      query: {
        q: JSON.stringify({ sort: { field: "id", direction: "desc" } }),
      },
    });
    expect(page.entries.map((entry) => entry.id)).toEqual([
      "nord",
      "midnight",
      "aurora",
      "abyss",
    ]);
  });

  it("cuts the requested window and echoes it", async () => {
    const page = await list({
      query: { q: JSON.stringify({ limit: 2, offset: 1 }) },
    });
    expect(page.entries).toEqual([
      { id: "midnight", name: "Midnight" },
      { id: "nord", name: "Nord" },
    ]);
    expect(page.total).toBe(4);
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(1);
  });

  it("answers 400 when the query is not JSON", async () => {
    await expect(list({ query: { q: "{not json" } })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("answers 400 when the query carries unknown fields", async () => {
    await expect(
      list({ query: { q: JSON.stringify({ bogus: true }) } }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("answers 500 when the manifest is missing", async () => {
    assets = {};
    await expect(list({})).rejects.toMatchObject({ statusCode: 500 });
  });

  it("answers 500 when the manifest is corrupt", async () => {
    assets = { "entries.json": [{ id: "", name: 7 }] };
    await expect(list({})).rejects.toMatchObject({ statusCode: 500 });
  });
});
