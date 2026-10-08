import type { Resolver } from "@terrazzo/parser";
import type { Template, Theme } from "@untheme/schema";
import type { Entry, Manifest } from "./types";

import { record } from "objectively";

import { EXTENSION } from "./constant";
import { axes } from "./contexts";

/**
 * Makes a display name from an id. The function splits the id on `-`, `_`, `.`,
 * and whitespace, and capitalizes each word. `night_owl` becomes `Night Owl`.
 */
export const title = (id: string): string => {
  return id
    .split(/[-_.\s]+/)
    .filter((word) => word !== "")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

/** Returns the display name in the untheme extension of a node, when it has one. */
export const named = (node: { $extensions?: unknown }): string | undefined => {
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

/** Makes an entry. The name is `name` or the titled id. A set description is included. */
export const entry = (
  id: string,
  name?: string,
  description?: unknown,
): Entry => {
  const found: Entry = { id, name: name ?? title(id) };
  if (typeof description === "string" && description !== "") {
    found.description = description;
  }
  return found;
};

/**
 * Describes the modifiers of a built theme for an interface that lets a person
 * choose among them. For each modifier, in order, the result has its id, name,
 * and description. The result has the same for each kept context.
 *
 * The descriptions come from the documents. The description of a modifier is its
 * `description` in the resolver document. The description of a context is the
 * `$description` at the root of the token file, or inline source, that the
 * context applies. The last source that has one wins. A name is the `name` under
 * the `io.zoobz.untheme` key of `$extensions`, on the modifier or at the root of
 * the source of the context. When there is no such name, the name is the titled
 * id. When there is no resolver, every entry has its titled id as its name.
 *
 * @param theme - The built theme. It sets the order and the kept contexts.
 * @param resolver - The parsed resolver that the theme was built from.
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
