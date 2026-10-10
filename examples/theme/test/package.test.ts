import type { Kit } from "@untheme/kit";
import type { Layer } from "untheme";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

import { makeUntheme } from "untheme";

import config, { type Contract, input, theme } from "../.dist/config.mjs";
import { isToken, modifiers, tokens } from "../.dist/index.mjs";
import layers from "../.dist/layers.mjs";
import manifest from "../.dist/manifest.mjs";

import { ROOT, build } from "./helpers";

/**
 * The package as an app installs it. The modules that `untheme build` wrote to
 * `.dist/` are the `.`, `./config`, `./manifest`, and `./layers` exports. The
 * layer files are the `./layers/*` exports. The palette is the `./src/*`
 * export. The tests compare the modules with a new build of the documents.
 */
let kit: Kit;

/** A built layer file, as the package exports it. */
const layer = async (id: string): Promise<Layer<Contract>> =>
  JSON.parse(
    await readFile(
      new URL(`../.dist/layers/${id}.json`, import.meta.url),
      "utf8",
    ),
  );

beforeAll(async () => {
  kit = await build();
});

describe("the built modules", () => {
  it("hold the theme and the boot selection the documents build to", () => {
    expect(theme).toEqual(kit.theme);
    expect(input).toEqual(kit.input);
    expect(config).toEqual({ theme, input });
  });

  it("list every token and every context of every modifier", () => {
    expect([...tokens]).toEqual(Object.keys(kit.theme.tokens));
    expect(Object.keys(modifiers)).toEqual(kit.theme.order);
    expect(isToken("primary")).toBe(true);
    expect(isToken("mantis")).toBe(false);
  });

  it("carry the manifest and the layer list the documents describe", async () => {
    expect(manifest).toEqual(kit.manifest);
    expect(layers).toEqual(kit.layers.map((built) => built.entry));
    for (const built of kit.layers) {
      expect(await layer(built.entry.id)).toEqual(built.layer);
    }
  });
});

describe("a consumer of the config module", () => {
  it("boots the palette with no kit of its own", () => {
    const ut = makeUntheme<Contract>(config.theme, {
      patch: {},
      input: config.input,
    });
    expect(ut.theme().id).toBe("mantis");
    expect(ut.get("primary")).toBe("{primary-600}");
    expect(ut.resolve("primary")).toEqual(
      kit.layers[0]?.layer.tokens?.["primary-600"],
    );
  });

  it("applies a theme of aurora from its layer file as it is", async () => {
    const ut = makeUntheme<Contract>(config.theme, {
      patch: {},
      input: config.input,
    });
    const before = ut.resolve("primary");
    const nord = await layer("nord");
    ut.apply(nord);
    expect(ut.theme().id).toBe("nord");
    expect(ut.resolve("primary")).not.toEqual(before);
    expect(ut.resolve("primary")).toEqual(nord.tokens?.["primary-600"]);
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(nord.tokens?.["neutral-200"]);
  });
});

describe("the package exports", () => {
  const require = createRequire(`${ROOT}package.json`);

  it("expose the palette and the preset for an npm reference", () => {
    expect(require.resolve("@untheme/example-theme/src/mantis.json")).toBe(
      `${ROOT}src/mantis.json`,
    );
    expect(require.resolve("@untheme/example-theme/preset.json")).toBe(
      `${ROOT}.dist/preset.json`,
    );
    expect(require.resolve("@untheme/example-theme/resolver.json")).toBe(
      `${ROOT}.dist/resolver.json`,
    );
  });

  it("are a source for another build, which reads the same theme", async () => {
    const { resolveKit } = await import("@untheme/kit");
    const downstream = await resolveKit(
      { source: "npm:/@untheme/example-theme" },
      { cwd: ROOT },
    );
    expect(downstream.theme).toEqual(kit.theme);
    expect(downstream.layers).toEqual(kit.layers);
  });

  it("expose the layer list and every layer file", () => {
    expect(import.meta.resolve("@untheme/example-theme/layers")).toBe(
      pathToFileURL(`${ROOT}.dist/layers.mjs`).href,
    );
    for (const built of kit.layers) {
      expect(
        require.resolve(`@untheme/example-theme/layers/${built.entry.id}.json`),
      ).toBe(`${ROOT}.dist/layers/${built.entry.id}.json`);
    }
  });
});
