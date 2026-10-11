import { describe, it, expect, vi } from "vitest";

const service = { marker: "untheme" };
const renderer = { marker: "renderer" };
const catalog = { marker: "catalog" };
const nuxtApp = {
  $untheme: service,
  $unthemeRenderer: renderer,
  $unthemeCatalog: catalog,
};

vi.mock("#app", () => ({
  useNuxtApp: () => nuxtApp,
}));

import {
  useUntheme,
  useUnthemeCatalog,
  useUnthemeRenderer,
} from "../../src/runtime/composable";

describe("useUntheme", () => {
  it("returns the $untheme service from the nuxt app", () => {
    expect(useUntheme()).toBe(service);
  });
});

describe("useUnthemeRenderer", () => {
  it("returns the $unthemeRenderer from the nuxt app", () => {
    expect(useUnthemeRenderer()).toBe(renderer);
  });
});

describe("useUnthemeCatalog", () => {
  it("returns the $unthemeCatalog from the nuxt app", () => {
    expect(useUnthemeCatalog()).toBe(catalog);
  });
});
