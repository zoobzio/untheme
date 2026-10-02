import type { Resolver } from "@terrazzo/parser";

import { bridged } from "./contexts";

/**
 * Identity for the base theme: explicit options win, then the resolver
 * document's own name — the id is its lowercase slug. A plain token document
 * carries no name (its synthetic resolver's name is Terrazzo's own), so there
 * the options are required.
 */
export const identity = (
  options: { id?: string | undefined; name?: string | undefined },
  resolver: Resolver | undefined,
): { id: string; name: string } => {
  let declared = resolver?.source.name;
  if (bridged(resolver)) {
    declared = undefined;
  }
  const name = options.name ?? declared;
  if (name === undefined) {
    throw new Error(
      '@untheme/kit: no theme identity — name the resolver document, or set "name" in the config',
    );
  }
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const id = options.id ?? slug;
  if (!id) {
    throw new Error(
      `@untheme/kit: the name "${name}" slugs to an empty id — set "id" in the config`,
    );
  }
  return { id, name };
};
