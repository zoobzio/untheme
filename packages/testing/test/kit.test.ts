import { describe, expect, it } from "vitest";

import { mockKit, stubKit } from "../src/kit";
import { mockManifest } from "../src/manifest";
import { mockTheme } from "../src/theme";

const theme = mockTheme({
  tokens: { a: 1 },
  modifiers: { color: { light: {}, dark: {} } },
});

describe("mockKit", () => {
  it("resolves the theme at a boot selection with a manifest and defaults", () => {
    const kit = mockKit(theme);
    expect(kit.theme).toBe(theme);
    expect(kit.input).toEqual({ color: "light" });
    expect(kit.manifest).toEqual(mockManifest(theme));
    expect(kit.outDir).toBe("untheme");
    expect(kit.documents).toEqual([]);
  });

  it("takes what the options pin", () => {
    const manifest = mockManifest(theme, { color: { name: "Scheme" } });
    const kit = mockKit(theme, {
      selection: { color: "dark" },
      manifest,
      outDir: "src/theme",
      documents: ["/app/tokens/resolver.json"],
    });
    expect(kit.input).toEqual({ color: "dark" });
    expect(kit.manifest).toBe(manifest);
    expect(kit.outDir).toBe("src/theme");
    expect(kit.documents).toEqual(["/app/tokens/resolver.json"]);
  });

  it("builds the manifest from prose when no manifest is pinned", () => {
    const kit = mockKit(theme, { prose: { color: { name: "Scheme" } } });
    expect(kit.manifest[0]?.name).toBe("Scheme");
  });
});

describe("stubKit", () => {
  it("answers loadConfig with the config and resolveKit with a copy of the kit", async () => {
    const kit = mockKit(theme);
    const { loadConfig, resolveKit } = stubKit(kit, { source: "./a.json" });
    await expect(loadConfig("/app/untheme.config.ts")).resolves.toEqual({
      source: "./a.json",
    });
    const resolved = await resolveKit({ source: "./a.json" });
    expect(resolved).toEqual(kit);
    expect(resolved).not.toBe(kit);
    expect(resolved.theme).not.toBe(kit.theme);
  });

  it("answers with a placeholder config by default", async () => {
    const { loadConfig } = stubKit(mockKit(theme));
    await expect(loadConfig("/app/untheme.config.ts")).resolves.toEqual({
      source: "./tokens/resolver.json",
    });
  });
});
