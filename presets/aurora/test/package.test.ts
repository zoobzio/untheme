import type { Kit } from "@untheme/kit";

import { createRequire } from "node:module";
import { beforeAll, describe, expect, it } from "vitest";

import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";

import { resolveKit } from "@untheme/kit";
import { resolveAll } from "@untheme/testing";

import config, { type Contract, input, theme } from "../.dist/config.mjs";
import { isModifier, isToken, modifiers, tokens } from "../.dist/index.mjs";
import manifest from "../.dist/manifest.mjs";

import { ROOT, build } from "./helpers";

/**
 * The package as an app installs it. The modules that `untheme build` wrote to
 * `.dist/` are the `.`, `./config`, and `./manifest` exports. The DTCG
 * documents are the `./src/*` exports. The tests compare the modules with a
 * new build of the documents, so a `.dist/` that is older than `src/` fails
 * here.
 */
let kit: Kit;

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
    expect(isModifier("theme")).toBe(true);
    expect(isModifier("palette")).toBe(false);
  });

  it("carry the manifest the documents describe", () => {
    expect(manifest).toEqual(kit.manifest);
  });
});

describe("a consumer of the config module", () => {
  it("boots a service with no kit of its own", () => {
    const ut = makeUntheme<Contract>(useUnthemeConfig(config));
    expect(ut.get("primary")).toBe("{primary-600}");
    expect(ut.resolve("primary")).toEqual(ut.resolve("primary-600"));
  });

  it("resolves every token at the boot selection", () => {
    const ut = makeUntheme<Contract>(useUnthemeConfig(config));
    expect(Object.keys(resolveAll(ut))).toEqual([...tokens]);
  });

  it("swaps every axis the preset declares", () => {
    const ut = makeUntheme<Contract>(useUnthemeConfig(config));
    const before = ut.resolve("primary");
    ut.swap("theme", "nord");
    expect(ut.resolve("primary")).not.toEqual(before);
    ut.swap("color", "dark");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-200"));
    ut.swap("contrast", "high");
    expect(ut.resolve("on-surface")).toEqual(ut.resolve("neutral-50"));
  });

  it("leaves the exported config untouched", () => {
    const ut = makeUntheme<Contract>(useUnthemeConfig(config));
    ut.swap("theme", "dracula");
    ut.set("primary", "{primary-50}");
    expect(input.theme).toBe("aurora");
    expect(theme.tokens.primary.$value).toBe("{primary-600}");
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
      { source: "npm:/@untheme/aurora/src/resolver.json" },
      { cwd: ROOT },
    );
    expect(referenced.theme).toEqual(kit.theme);
    expect(referenced.input).toEqual(kit.input);
  });
});
