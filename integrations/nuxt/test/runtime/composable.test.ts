import { describe, it, expect, vi } from "vitest";

const service = { marker: "untheme" };
const nuxtApp = { $untheme: service };

vi.mock("#app", () => ({
  useNuxtApp: () => nuxtApp,
}));

import { useUntheme } from "../../src/runtime/composable";

describe("useUntheme", () => {
  it("returns the $untheme service from the nuxt app", () => {
    expect(useUntheme()).toBe(service);
  });
});
