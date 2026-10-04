import type { KitConfig, ModifierConfig } from "./types";

import { record } from "objectively";

import { InvalidConfigError } from "./error";
import { locate } from "./source";

/** The `$ref` an entry of `resolutionOrder` names a top-level modifier by. */
const POINTER = "#/modifiers/";

/**
 * One modifier of a resolver document as its resolution order applies it:
 * the modifier object itself, where the order holds it, and — when the order
 * references it rather than declaring it inline — its key in the top-level
 * `modifiers` map.
 */
interface Declared {
  modifier: Record<string, unknown>;
  at: number;
  key: string | undefined;
}

/**
 * Finds every modifier the resolution order applies, by name: one referenced
 * from the top-level `modifiers` map, and one declared inline in the order
 * itself, alike. A modifier the order never applies is not an axis and is not
 * found.
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

/** A name for an inline set that no set of the document already has. */
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
 * Applies one modifier's changes to its declaration: adds the config's own
 * contexts, keeps the listed ones in the listed order, and sets the default.
 * Returns the issues found; the modifier is left untouched when there are any.
 */
const change = (
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
 * Tailors a resolver document to a config's `modifiers` before it is parsed,
 * so everything downstream — the parse, the conversion, the proof — sees a
 * document that declares exactly what the build keeps:
 *
 * - a modifier set to `false` is turned off: its default context's sources
 *   stay in the resolution order as a set, and the modifier is gone;
 * - `add` gives a modifier contexts of the config's own, each the token
 *   files it names;
 * - `contexts` keeps only the listed contexts, in the listed order — a
 *   context left out is never read;
 * - `default` names the context the modifier boots at. Without it the
 *   document's default boots when it is kept, else the first kept context.
 *
 * @param src - The resolver document, as text.
 * @param changes - The config's `modifiers`.
 * @param base - The project root that added sources resolve against.
 * @returns The tailored document, as text.
 * @throws InvalidConfigError when the config names a modifier or a context
 * the document does not declare, or a default it does not keep.
 */
export const tailor = (
  src: string,
  changes: NonNullable<KitConfig["modifiers"]>,
  base: URL,
): string => {
  let document: unknown;
  try {
    document = JSON.parse(src);
  } catch {
    document = undefined;
  }
  let order: unknown[] = [];
  if (record(document) && Array.isArray(document.resolutionOrder)) {
    order = document.resolutionOrder;
  }
  const found = record(document)
    ? declared(document, order)
    : new Map<string, Declared>();
  const known = [...found.keys()].join(", ") || "none";

  const issues: string[] = [];
  for (const [name, config] of Object.entries(changes)) {
    const entry = found.get(name);
    if (!entry || !record(document)) {
      issues.push(
        `modifiers.${name}: the source declares no modifier "${name}" (${known})`,
      );
      continue;
    }
    const { modifier, at, key } = entry;
    if (config !== false) {
      issues.push(...change(name, modifier, config, base));
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
