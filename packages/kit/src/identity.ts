import type { Resolver } from "@terrazzo/parser";

import { bridged } from "./contexts";

/**
 * Returns the id and the name of the base theme. A name in the options wins over
 * the name of the resolver document. The id is the lowercase slug of the name.
 * A plain token document has no name of its own, so the options must give one.
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
