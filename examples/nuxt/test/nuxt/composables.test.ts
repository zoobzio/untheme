import type { Untheme } from "untheme";
import type * as CatalogModule from "untheme/catalog";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, reactive, ref } from "vue";

import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { mockCatalog } from "@untheme/testing";

import { modules, theme } from "./fixtures";
import { fixtureLayers as layers } from "./layers";
import { useControls } from "../../app/composables/controls";
import { useDemo } from "../../app/composables/demo";
import { useThemes } from "../../app/composables/themes";

/*
 * The manifest module of the fixture, in place of the build template. The
 * factory imports the fixture itself, because `vi.mock` is hoisted above the
 * imports of this file.
 */
vi.mock("#build/untheme/manifest.mjs", async () => {
  const fixtures = await import("./fixtures");
  return fixtures.modules.manifest;
});

/*
 * A catalog over the fixture layers, in place of the client over the wire.
 * The factory imports the layers itself, because `vi.mock` is hoisted above
 * the imports of this file.
 */
vi.mock("untheme/catalog", async (original) => {
  const actual = await original<typeof CatalogModule>();
  const { fixtureLayers: layers } = await import("./layers");
  return {
    ...actual,
    defineClient: (schema: Parameters<typeof actual.defineCatalog>[0]) =>
      actual.defineCatalog(schema, {
        list: (listing) => ({
          entries: layers
            .map(({ id, name }) => ({ id, name }))
            .slice(listing.offset, listing.offset + listing.limit),
          total: layers.length,
          limit: listing.limit,
          offset: listing.offset,
        }),
        get: (id) => layers.find((layer) => layer.id === id),
      }),
  };
});

/*
 * The auto-imports of Nuxt, as globals for each test. `useUntheme` returns a
 * new service over the fixture theme and a reactive container.
 */
let untheme: Untheme<typeof theme>;

beforeEach(() => {
  untheme = makeUntheme<typeof theme>(
    theme,
    reactive(useUnthemeConfig(modules.config)),
  );
  vi.stubGlobal("useUntheme", () => untheme);
  vi.stubGlobal("useDemo", useDemo);
  vi.stubGlobal("computed", computed);
  vi.stubGlobal("ref", ref);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useControls", () => {
  it("lists the contexts an axis offers", () => {
    const { options } = useControls("color");
    expect(options).toEqual(["light", "dark"]);
  });

  it("reads the axis's active context", () => {
    const { selection } = useControls("density");
    expect(selection.value).toBe("default");
    untheme.swap("density", "cozy");
    expect(selection.value).toBe("cozy");
  });

  it("swaps the app to the chosen context on write", () => {
    const { selection } = useControls("color");
    selection.value = "dark";
    expect(untheme.config.input.color).toBe("dark");
    expect(untheme.resolve("surface")).toEqual(untheme.resolve("black"));
  });
});

describe("useDemo", () => {
  it("lists the axes in composition order, with the generated manifest", () => {
    const { axes, manifest } = useDemo();
    expect(axes).toEqual(["color", "density"]);
    expect(manifest).toBe(modules.manifest.manifest);
    expect(manifest[0]).toMatchObject({ id: "color", name: "Color scheme" });
    expect(manifest[0]?.contexts[1]).toEqual({
      id: "dark",
      name: "Dark",
      description: "Lights off.",
    });
  });

  it("shuffles to a selection the contract accepts", () => {
    const { shuffle } = useDemo();
    for (let round = 0; round < 10; round += 1) {
      shuffle();
      expect(untheme.schema.check.input(untheme.config.input)).toBe(true);
    }
  });

  it("picks from a list, and refuses an empty one", () => {
    const { pick } = useDemo();
    expect(["a", "b"]).toContain(pick(["a", "b"]));
    expect(() => pick([])).toThrow(/empty list/);
  });

  it("runs a change directly where view transitions are unavailable", () => {
    const { transition } = useDemo();
    const change = vi.fn();
    transition(change);
    expect(change).toHaveBeenCalledOnce();
  });
});

describe("useThemes", () => {
  it("starts from the layers manifest and the id of the base theme", () => {
    const { entries, active } = useThemes();
    expect(entries.value.map((entry) => entry.id)).toEqual([
      "fixture",
      "ink",
      "paper",
    ]);
    expect(active.value).toBe("fixture");
  });

  it("refreshes the entries from the catalog", async () => {
    const { entries, refresh } = useThemes();
    entries.value = [];
    await refresh();
    expect(entries.value.map((entry) => entry.id)).toEqual([
      "fixture",
      "ink",
      "paper",
    ]);
  });

  it("applies the layer of a selected theme and tracks the active id", async () => {
    const { active, select } = useThemes();
    await select("ink");
    expect(active.value).toBe("ink");
    expect(untheme.config.layer).toEqual(layers[1]);
    expect(untheme.resolve("surface")).toEqual(untheme.resolve("black"));
  });

  it("leaves the state alone on a miss", async () => {
    const { active, select } = useThemes();
    await select("ghost");
    expect(active.value).toBe("fixture");
    expect(untheme.config.layer).toBeUndefined();
  });

  it("checks each layer against the contract on the way in", async () => {
    const catalog = mockCatalog(untheme.schema, [
      { id: "bad", name: "Bad", tokens: { ghost: "#fff" } } as never,
    ]);
    await expect(catalog.get("bad")).rejects.toThrow();
  });
});
