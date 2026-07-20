import { describe, it, expect, vi, beforeEach } from "vitest";
import { themes } from "../../fixtures";

/*
 * The storage the mocked `useStorage` answers from: keys are asset names,
 * values whatever the test plants there.
 */
let assets: Record<string, unknown>;

vi.mock("h3", () => ({
  defineEventHandler: (handler: unknown) => handler,
  getRouterParam: (event: { params?: Record<string, string> }, name: string) =>
    event.params?.[name],
  createError: (input: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}));

vi.mock("nitropack/runtime", () => ({
  useStorage: () => ({
    getItem: (key: string) => Promise.resolve(assets[key] ?? null),
  }),
}));

import handler from "../../../src/runtime/server/get";

type GetRoute = (event: {
  params?: Record<string, string>;
}) => Promise<unknown>;
const get = handler as unknown as GetRoute;

describe("catalog retrieval route", () => {
  beforeEach(() => {
    assets = { "themes.json": { bravo: themes.bravo } };
  });

  it("answers with the stored layer for the id", async () => {
    await expect(get({ params: { id: "bravo" } })).resolves.toEqual(
      themes.bravo,
    );
  });

  it("answers 404 for a miss", async () => {
    await expect(get({ params: { id: "ghost" } })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("answers 400 when no id is carried", async () => {
    await expect(get({})).rejects.toMatchObject({ statusCode: 400 });
  });

  it("answers 500 when the payload record is missing", async () => {
    assets = {};
    await expect(get({ params: { id: "bravo" } })).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
