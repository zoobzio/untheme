import type { Untheme } from "untheme";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, reactive } from "vue";

import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";

import type { theme } from "./fixtures";

import { modules } from "./fixtures";
import { useControls } from "../../app/composables/controls";
import { useDemo } from "../../app/composables/demo";

/*
 * The generated manifest module, mocked with the module of the fixture. The
 * composables run against a theme that no kit build made. The factory imports
 * the fixture itself, because `vi.mock` is hoisted above the imports of this
 * file.
 */
vi.mock("#build/untheme/manifest.mjs", async () => {
  const fixtures = await import("./fixtures");
  return fixtures.modules.manifest;
});

/*
 * Nuxt auto-imports `useUntheme` and `computed` into the composables. Here
 * each one is a global for the duration of a test. `useUntheme` answers with
 * a fresh service per test. The service runs over a reactive container, the
 * same way the plugin of the module builds one over `useState`. A `computed`
 * in a composable then tracks the selection the way it does in the app.
 */
let untheme: Untheme<typeof theme>;

beforeEach(() => {
  untheme = makeUntheme<typeof theme>(
    reactive(useUnthemeConfig(modules.config)),
  );
  vi.stubGlobal("useUntheme", () => untheme);
  vi.stubGlobal("computed", computed);
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
