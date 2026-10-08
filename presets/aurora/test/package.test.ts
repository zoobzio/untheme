import type { Kit } from "@untheme/kit";
import type { Layer } from "untheme";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

import { makeUntheme } from "untheme";

import { resolveKit } from "@untheme/kit";
import { resolveAll } from "@untheme/testing";

import config, { type Contract, input, theme } from "../.dist/config.mjs";
import { isModifier, isToken, modifiers, tokens } from "../.dist/index.mjs";
import layers from "../.dist/layers.mjs";
import manifest from "../.dist/manifest.mjs";

import { ROOT, build } from "./helpers";

/**
 * The package as an app installs it. The modules that `untheme build` wrote to
 * `.dist/` are the `.`, `./config`, `./manifest`, and `./layers` exports. The
 * layer files are the `./layers/*` exports. The DTCG documents are the
 * `./src/*` exports. The tests compare the modules with a new build of the
 * documents.
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
    for (const [modifier, contexts] of Object.entries(modifiers)) {
      expect([...contexts]).toEqual(
        Object.keys(kit.theme.modifiers[modifier] ?? {}),
      );
    }
    expect(isToken("primary")).toBe(true);
    expect(isToken("primary-9000")).toBe(false);
    expect(isModifier("color")).toBe(true);
    expect(isModifier("theme")).toBe(false);
  });

  it("carry the manifest the documents describe", () => {
    expect(manifest).toEqual(kit.manifest);
  });

  it("list every layer and hold each one as a file", async () => {
    expect(layers).toEqual(kit.layers.map((built) => built.entry));
    for (const built of kit.layers) {
      expect(await layer(built.entry.id)).toEqual(built.layer);
    }
  });
});

describe("a consumer of the config module", () => {
  it("boots a service with no kit of its own", () => {
    const ut = makeUntheme<Contract>(config.theme, { patch: {}, input: config.input });
    expect(ut.get("primary")).toBe("{primary-600}");
    expect(ut.resolve("primary")).toEqual(ut.resolve("primary-600"));
  });

  it("resolves every token at the boot selection", () => {
    const ut = makeUntheme<Contract>(config.theme, { patch: {}, input: config.input });
    expect(Object.keys(resolveAll(ut))).toEqual([...tokens]);
  });

  it("swaps every axis the preset declares", () => {
    const ut = makeUntheme<Contract>(config.theme, { patch: {}, input: config.input });
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-200"));
    ut.swap("contrast", "high");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-50"));
  });

  it("applies a theme from its layer file as it is", async () => {
    const ut = makeUntheme<Contract>(config.theme, { patch: {}, input: config.input });
    const before = ut.resolve("primary");
    const nord = await layer("nord");
    ut.apply(nord);
    expect(ut.theme().id).toBe("nord");
    expect(ut.resolve("primary")).not.toEqual(before);
    expect(ut.resolve("primary")).toEqual(nord.tokens?.["primary-600"]);
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(nord.tokens?.["neutral-200"]);
  });

  it("leaves the exported config untouched", async () => {
    const ut = makeUntheme<Contract>(config.theme, { patch: {}, input: config.input });
    ut.apply(await layer("dracula"));
    ut.update({ tokens: { primary: "{primary-50}" } });
    expect(input.color).toBe("light");
    expect(theme.tokens.primary.$value).toBe("{primary-600}");
    expect(theme.tokens["primary-600"].$value).toEqual(
      kit.theme.tokens["primary-600"]?.$value,
    );
  });
});

describe("the package exports", () => {
  const require = createRequire(`${ROOT}package.json`);

  it("expose every DTCG document for an npm reference", () => {
    for (const path of kit.documents) {
      const specifier = `@untheme/aurora/src/${path
        .slice(`${ROOT}src/`.length)
        .replace(/\\/g, "/")}`;
      expect(require.resolve(specifier)).toBe(path);
    }
  });

  it("build the same theme through an npm reference as from the path", async () => {
    const referenced = await resolveKit(
      {
        source: "npm:/@untheme/aurora/src/resolver.json",
        layers: { nord: "npm:/@untheme/aurora/src/themes/nord.json" },
      },
      { cwd: ROOT },
    );
    expect(referenced.theme).toEqual(kit.theme);
    expect(referenced.input).toEqual(kit.input);
    expect(referenced.layers[0]).toEqual(
      kit.layers.find((built) => built.entry.id === "nord"),
    );
  });

  it("expose the layer list and every layer file", () => {
    expect(import.meta.resolve("@untheme/aurora/layers")).toBe(
      pathToFileURL(`${ROOT}.dist/layers.mjs`).href,
    );
    for (const built of kit.layers) {
      expect(
        require.resolve(`@untheme/aurora/layers/${built.entry.id}.json`),
      ).toBe(`${ROOT}.dist/layers/${built.entry.id}.json`);
    }
  });
});
