import type { KitConfig, ModifierConfig } from "./types";

import { record } from "objectively";

import { InvalidConfigError } from "./error";
import { anchor, merge } from "./merge";
import { locate } from "./source";

/** The `$ref` prefix of an entry in `resolutionOrder` that names a top-level modifier. */
const POINTER = "#/modifiers/";

/**
 * One modifier of a resolver document as the resolution order applies it.
 * `modifier` is the modifier object. `at` is its index in the order. `key` is
 * its key in the top-level `modifiers` map when the order references it, and
 * `undefined` when the order declares it inline.
 */
interface Declared {
  modifier: Record<string, unknown>;
  at: number;
  key: string | undefined;
}

/**
 * Finds the modifiers that the resolution order applies, by name. This includes
 * a modifier referenced from the top-level `modifiers` map and a modifier
 * declared inline in the order. The function skips a modifier that the order
 * applies to no axis.
 */
const declared = (
  document: Record<string, unknown>,
  order: unknown[],
): Map<string, Declared> => {
  const found = new Map<string, Declared>();
  let top: Record<string, unknown> = {};
  if (record(document.modifiers)) {
    top = document.modifiers;
  }
  for (const [at, entry] of order.entries()) {
    if (!record(entry)) {
      continue;
    }
    if (typeof entry.$ref === "string" && entry.$ref.startsWith(POINTER)) {
      const key = entry.$ref
        .slice(POINTER.length)
        .replaceAll("~1", "/")
        .replaceAll("~0", "~");
      const modifier = top[key];
      if (record(modifier)) {
        found.set(key, { modifier, at, key });
      }
      continue;
    }
    if (entry.type === "modifier" && typeof entry.name === "string") {
      found.set(entry.name, { modifier: entry, at, key: undefined });
    }
  }
  return found;
};

/** Returns a name that no set of the document has. */
const unused = (document: Record<string, unknown>, name: string): string => {
  const taken = new Set<string>();
  if (record(document.sets)) {
    for (const key of Object.keys(document.sets)) {
      taken.add(key);
    }
  }
  let candidate = name;
  while (taken.has(candidate)) {
    candidate = `${candidate}-default`;
  }
  return candidate;
};

/**
 * Applies the changes of one modifier to its declaration. The function adds the
 * contexts of the config, keeps the listed contexts in the listed order, and
 * sets the default. The function returns the issues that it finds. When there
 * are issues, the function leaves the modifier as it was.
 */
const changes = (
  name: string,
  modifier: Record<string, unknown>,
  config: ModifierConfig,
  base: URL,
): string[] => {
  const issues: string[] = [];
  const contexts: Record<string, unknown> = {};
  if (record(modifier.contexts)) {
    Object.assign(contexts, modifier.contexts);
  }
  const existing = Object.keys(contexts);

  for (const [context, source] of Object.entries(config.add ?? {})) {
    if (existing.includes(context)) {
      issues.push(
        `modifiers.${name}.add: "${context}" is already a context of "${name}"`,
      );
      continue;
    }
    contexts[context] = [source]
      .flat()
      .map((file) => ({ $ref: locate(file, base).href }));
  }

  const available = Object.keys(contexts);
  const kept = config.contexts ?? available;
  for (const context of kept) {
    if (!available.includes(context)) {
      issues.push(
        `modifiers.${name}.contexts: "${context}" is not a context of "${name}" (${available.join(", ")})`,
      );
    }
  }

  let boot: unknown = config.default;
  if (boot === undefined && modifier.default !== undefined) {
    boot = modifier.default;
    if (typeof boot !== "string" || !kept.includes(boot)) {
      boot = kept[0];
    }
  }
  if (typeof boot === "string" && !kept.includes(boot)) {
    issues.push(
      `modifiers.${name}.default: "${boot}" is not one of the kept contexts (${kept.join(", ")})`,
    );
  }

  if (issues.length === 0) {
    modifier.contexts = Object.fromEntries(
      kept.map((context) => [context, contexts[context]]),
    );
    if (boot !== undefined) {
      modifier.default = boot;
    }
  }
  return issues;
};

/**
 * Tailors a source document to the `extend` and the `modifiers` of a config
 * before the parse. The tailored document declares what the build keeps. The
 * parse, the conversion, and the verification read it.
 *
 * The function merges `extend` first. The fragment merges onto the document
 * with {@link merge}, after {@link anchor} resolves each relative `$ref` of
 * the fragment from the project root. The `modifiers` then act on the merged
 * document, so they can keep or turn off a context that the fragment added.
 *
 * - A modifier set to `false` is turned off. The sources of its default context
 *   stay in the resolution order as a set, and the modifier is removed.
 * - `add` gives a modifier contexts of the config's own. Each context applies
 *   the token files that it names.
 * - `contexts` keeps the listed contexts, in the listed order. The build drops a
 *   context that the list omits.
 * - `default` names the context that the modifier boots at. When `default` is
 *   absent, the default of the document boots if the config keeps it. Otherwise
 *   the first kept context boots.
 *
 * @param src - The source document, as text.
 * @param config - The `extend` and the `modifiers` of the config.
 * @param base - The project root that added sources resolve against.
 * @returns The tailored document, as text.
 * @throws InvalidConfigError when the source is not an object, or the config
 * names a modifier or a context that is missing from the document, or a
 * default that the config does not keep.
 */
export const tailor = (
  src: string,
  config: Pick<KitConfig, "extend" | "modifiers">,
  base: URL,
): string => {
  let document: unknown;
  try {
    document = JSON.parse(src);
  } catch {
    document = undefined;
  }
  const issues: string[] = [];
  if (config.extend !== undefined) {
    if (record(document)) {
      document = merge(document, anchor(config.extend, base));
    } else {
      issues.push("extend: the source is not a JSON object");
    }
  }
  let order: unknown[] = [];
  if (record(document) && Array.isArray(document.resolutionOrder)) {
    order = document.resolutionOrder;
  }
  const found = record(document)
    ? declared(document, order)
    : new Map<string, Declared>();
  const known = [...found.keys()].join(", ") || "none";

  for (const [name, change] of Object.entries(config.modifiers ?? {})) {
    const entry = found.get(name);
    if (!entry || !record(document)) {
      issues.push(
        `modifiers.${name}: the source declares no modifier "${name}" (${known})`,
      );
      continue;
    }
    const { modifier, at, key } = entry;
    if (change !== false) {
      issues.push(...changes(name, modifier, change, base));
      continue;
    }
    if (typeof modifier.default !== "string") {
      issues.push(
        `modifiers.${name}: a modifier with no default context cannot be turned off`,
      );
      continue;
    }
    let sources: unknown = [];
    if (record(modifier.contexts)) {
      sources = modifier.contexts[modifier.default] ?? [];
    }
    order[at] = { type: "set", name: unused(document, name), sources };
    if (key !== undefined && record(document.modifiers)) {
      delete document.modifiers[key];
    }
  }
  if (issues.length > 0) {
    throw new InvalidConfigError(issues);
  }
  return JSON.stringify(document, null, 2);
};
