import type { Layer, Untheme } from "untheme";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, reactive, ref } from "vue";

import { makeUntheme } from "untheme";

import { modules, theme } from "./fixtures";
import { fixtureLayers, layers } from "./layers";
import { useControls } from "../../app/composables/controls";
import { useDemo } from "../../app/composables/demo";

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
 * The auto-imports of Nuxt, as globals for each test. `useUntheme` returns a
 * new service over the fixture theme and a reactive container, with the
 * fixture layers as the layers of the build.
 */
let untheme: Untheme<typeof theme> & {
  layers: typeof layers;
  select: (id: string) => Promise<Layer<typeof theme> | undefined>;
};

beforeEach(() => {
  const service = makeUntheme<typeof theme>(
    theme,
    reactive({ patch: {}, input: modules.config.input }),
  );
  untheme = Object.assign(service, {
    layers,
    select: async (id: string) => {
      const layer = fixtureLayers.find((layer) => layer.id === id);
      if (layer !== undefined) {
        service.apply(layer);
      }
      return layer;
    },
  });
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

  it("shuffles to a selection the contract accepts, and to a theme", async () => {
    const { shuffle } = useDemo();
    const ids = layers.map((entry) => entry.id);
    for (let round = 0; round < 10; round += 1) {
      await shuffle();
      expect(untheme.schema.check.input(untheme.config.input)).toBe(true);
      expect(ids).toContain(untheme.theme().id);
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
