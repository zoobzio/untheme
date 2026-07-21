import { describe, it, expect, vi } from "vitest";

const service = { marker: "untheme" };
const renderer = { marker: "renderer" };
const nuxtApp = { $untheme: service, $unthemeRenderer: renderer };

vi.mock("#app", () => ({
  useNuxtApp: () => nuxtApp,
}));

import { useUntheme, useUnthemeRenderer } from "../../src/runtime/composable";

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
