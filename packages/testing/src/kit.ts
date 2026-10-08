import type { Template, Theme } from "untheme";
import type { Kit, KitConfig, loadConfig, resolveKit } from "@untheme/kit";
import type { KitOptions } from "./types";

import { mockInput } from "./input";
import { mockManifest } from "./manifest";

/**
 * Returns a resolved kit over a theme. This is what `resolveKit` returns for
 * a config, without a read of any document. The kit has the theme, a boot
 * selection, a manifest, the layers, the output directory, and the documents
 * read. A
 * test of code that builds through the kit, such as a framework module, uses
 * it to run without DTCG JSON or Terrazzo.
 *
 * @param theme - The theme that the kit resolved to.
 * @param options - The members of the kit other than the theme.
 */
export const mockKit = <T extends Template>(
  theme: T,
  options: KitOptions<T> = {},
): Kit => {
  return {
    theme: theme as Theme<Template>,
    input: mockInput(theme, options.selection),
    manifest: options.manifest ?? mockManifest(theme, options.prose),
    layers: options.layers ?? [],
    outDir: options.outDir ?? "untheme",
    documents: options.documents ?? [],
  };
};

/**
 * Returns stubs for the two members of `@untheme/kit` that read the
 * filesystem. `loadConfig` answers with the config. `resolveKit` answers with
 * a detached copy of the kit. Spread the stubs over the real module in a mock
 * factory. The rest of the kit stays real, which includes `emit` and the
 * constants.
 *
 * ```ts
 * vi.mock("@untheme/kit", async (original) => ({
 *   ...(await original<typeof import("@untheme/kit")>()),
 *   ...stubKit(kit),
 * }));
 * ```
 *
 * @param kit - The kit that every build resolves to.
 * @param config - The config that `loadConfig` answers with.
 */
export const stubKit = (
  kit: Kit,
  config: KitConfig = { source: "./tokens/resolver.json" },
): { loadConfig: typeof loadConfig; resolveKit: typeof resolveKit } => {
  return {
    loadConfig: async () => config,
    resolveKit: async () => structuredClone(kit),
  };
};
