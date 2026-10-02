import { describe, expect, it } from "vitest";

import { identity } from "../src/identity";
import { load } from "./helpers";

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
