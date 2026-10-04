import type { Resolver } from "@terrazzo/parser";
import type { Template, Theme } from "@untheme/schema";
import type { Entry, Manifest } from "./types";

import { record } from "objectively";

import { EXTENSION } from "./constant";
import { axes } from "./contexts";

/**
 * A display name for an id that carries none of its own: its words split on
 * `-`, `_` and `.`, each capitalized — `night_owl` is `Night Owl`.
 */
export const title = (id: string): string => {
  return id
    .split(/[-_.\s]+/)
    .filter((word) => word !== "")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

/** The display name a node's untheme extension carries, when it has one. */
const named = (node: { $extensions?: unknown }): string | undefined => {
  const { $extensions } = node;
  if (!record($extensions)) {
    return undefined;
  }
  const extension = $extensions[EXTENSION];
  if (record(extension) && typeof extension.name === "string") {
    return extension.name;
  }
  return undefined;
};

/** An entry: the id, its name or the titled id, and a description when set. */
const entry = (id: string, name?: string, description?: unknown): Entry => {
  const found: Entry = { id, name: name ?? title(id) };
  if (typeof description === "string" && description !== "") {
    found.description = description;
  }
  return found;
};

/**
 * Describes a built theme's modifiers for an interface that lets someone
 * choose among them: per modifier, in order, its id, name and description,
 * and the same for each context it kept.
 *
 * The descriptions travel with the documents. A modifier's is its
 * `description` in the resolver document; a context's is the `$description`
 * at the root of the token file — or inline source — it applies, the last
 * one that has it winning. A name is the `name` under the `io.zoobz.untheme` key of
 * `$extensions`, on the modifier or at the root of the context's source;
 * without one it is the id, titled. Without a resolver — a theme built
 * elsewhere — every entry is its id and titled name.
 *
 * @param theme - The built theme: its order and the contexts it kept.
 * @param resolver - The parsed resolver the theme was built from.
 */
export const describe = (
  theme: Theme<Template>,
  resolver?: Resolver,
): Manifest => {
  const declared = new Map(axes(resolver).map((axis) => [axis.name, axis]));
  return theme.order.map((modifier) => {
    const axis = declared.get(modifier);
    const contexts = Object.keys(theme.modifiers[modifier] ?? {}).map((id) => {
      let name: string | undefined;
      let description: unknown;
      for (const source of axis?.contexts[id] ?? []) {
        if (!record(source)) {
          continue;
        }
        name = named(source) ?? name;
        description = source.$description ?? description;
      }
      return entry(id, name, description);
    });
    let name: string | undefined;
    if (axis) {
      name = named(axis);
    }
    return { ...entry(modifier, name, axis?.description), contexts };
  });
};
