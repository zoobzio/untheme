import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import type { H3Event } from "h3";
import { createEvent } from "../fixtures";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

vi.mock("h3", async (importOriginal) => ({
  ...(await importOriginal<typeof import("h3")>()),
  defineEventHandler: (handler: (event: H3Event) => unknown) => handler,
  getRouterParams: vi.fn(),
}));

vi.mock("ltrl-http", () => ({
  status: {
    UNPROCESSABLE_ENTITY: 422,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  useHTTPCode: (code: number) => `HTTP ${code}`,
}));

import handler from "../../runtime/handler";
import { getRouterParams } from "h3";

const enoent = () => {
  const err = new Error("ENOENT") as NodeJS.ErrnoException;
  err.code = "ENOENT";
  return err;
};

describe("theme server handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 422 when theme param is missing", () => {
    vi.mocked(getRouterParams).mockReturnValue({});
    const event = createEvent();
    handler(event);
    expect(event.res.status).toBe(422);
  });

  it("returns 404 when theme file does not exist", () => {
    vi.mocked(getRouterParams).mockReturnValue({ theme: "alpha" });
    vi.mocked(readFileSync).mockImplementation(() => { throw enoent(); });
    const event = createEvent();
    handler(event);
    expect(event.res.status).toBe(404);
  });

  it("returns parsed JSON when theme file exists", () => {
    vi.mocked(getRouterParams).mockReturnValue({ theme: "alpha" });
    vi.mocked(readFileSync).mockReturnValue('{"label":"Alpha"}');
    const event = createEvent();
    const result = handler(event);
    expect(result).toEqual({ label: "Alpha" });
  });

  it("returns 500 when file cannot be parsed", () => {
    vi.mocked(getRouterParams).mockReturnValue({ theme: "alpha" });
    vi.mocked(readFileSync).mockReturnValue("not json");
    const event = createEvent();
    handler(event);
    expect(event.res.status).toBe(500);
  });

  it("reads from the .untheme directory", () => {
    vi.mocked(getRouterParams).mockReturnValue({ theme: "alpha" });
    vi.mocked(readFileSync).mockReturnValue("{}");
    const event = createEvent();
    handler(event);
    const path = vi.mocked(readFileSync).mock.calls[0][0] as string;
    expect(path).toContain(".untheme");
    expect(path).toContain("alpha.json");
  });
});
