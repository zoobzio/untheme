import type { Req } from "./types";

import { record } from "objectively";

import { locate } from "./source";

/** The kinds of root-level declarations that a reference can target. */
type Kind = "sets" | "modifiers";

/** A reference to a set or a modifier at the root of a resolver document. */
interface Target {
  url: URL;
  kind: Kind;
  name: string;
}

/** The JSON pointer of a set or a modifier at the root of a document. */
const POINTER = /^\/(sets|modifiers)\/([^/]+)$/;

/** Decodes one JSON pointer segment. */
const segment = (raw: string): string => {
  return decodeURIComponent(raw).replaceAll("~1", "/").replaceAll("~0", "~");
};

/**
 * Reads a `$ref` as a reference to a set or a modifier. The function resolves
 * the document part against `document`. A same-document pointer keeps the
 * document. The result is `undefined` when the pointer names anything else, so
 * the parser reports or resolves it.
 */
const target = ($ref: string, document: URL): Target | undefined => {
  const at = $ref.indexOf("#");
  const path = at === -1 ? $ref : $ref.slice(0, at);
  const fragment = at === -1 ? "" : $ref.slice(at + 1);
  const match = POINTER.exec(fragment);
  if (!match) {
    return undefined;
  }
  const url = path === "" ? document : locate(path, document);
  return { url, kind: match[1] as Kind, name: segment(match[2]!) };
};

/** Whether a reference points into another document than `document`. */
const external = (found: Target, document: URL): boolean => {
  return found.url.href !== document.href;
};

/**
 * Rebases each `$ref` inside a value to the document that the value came
 * from. A relative path becomes an absolute URL. A same-document pointer
 * becomes a pointer into that document. Every other key is copied.
 */
const rebase = (value: unknown, origin: URL): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => rebase(item, origin));
  }
  if (!record(value)) {
    return value;
  }
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === "$ref" && typeof item === "string") {
      out[key] = item.startsWith("#")
        ? `${origin.href}${item}`
        : locate(item, origin).href;
    } else {
      out[key] = rebase(item, origin);
    }
  }
  return out;
};

/** A copy of a record without its `$ref`: the keys that override the target. */
const overrides = (value: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== "$ref"),
  );
};

/** The singular of a kind, for a message. */
const one = (kind: Kind): string => kind.slice(0, -1);

/**
 * Expands the references of a resolver document to the sets and modifiers of
 * other documents. The DTCG resolver format lets a `$ref` point into another
 * document, as in `other.resolver.json#/sets/colors`, and lets the keys beside
 * a `$ref` override the keys of what it points to. Terrazzo reads only a
 * same-document pointer as a set or a modifier. The kit inlines each external
 * one before the parse, so the parser sees an inline set or modifier with the
 * same content, and every `$ref` inside it still resolves against the document
 * that declared it.
 *
 * - An item of `resolutionOrder` that references a set or a modifier of another
 *   document becomes that set or modifier inline, with its `type` and `name`.
 *   The keys beside the `$ref` override its keys, one level deep.
 * - An entry of the root `sets` or `modifiers` map that references another
 *   document becomes a copy of the target, with the same overrides.
 * - A target that is itself a reference is followed. The overrides of each step
 *   apply in turn.
 *
 * Nothing else changes. The function returns `src` as it is when the document
 * has no such reference.
 *
 * @param src - The resolver document, as text.
 * @param url - The URL of the document. Relative references resolve against it.
 * @param load - The loader of the build. Each referenced document is read once.
 * @returns The document with every external set and modifier inline, as text.
 * @throws Error when a reference names a set or a modifier that its document
 * lacks, when a set references a modifier or a modifier a set, or when a chain
 * of references loops.
 */
export const compose = async (
  src: string,
  url: URL,
  load: Req,
): Promise<string> => {
  let document: unknown;
  try {
    document = JSON.parse(src);
  } catch {
    return src;
  }
  if (!record(document)) {
    return src;
  }

  const documents = new Map<string, Promise<unknown>>();
  const read = (at: URL): Promise<unknown> => {
    let pending = documents.get(at.href);
    if (!pending) {
      pending =
        at.href === url.href
          ? Promise.resolve(document)
          : load(at, url).then((text) => JSON.parse(text) as unknown);
      documents.set(at.href, pending);
    }
    return pending;
  };

  /**
   * Resolves a set or a modifier to its content, with each `$ref` inside it
   * rebased to its document and each reference in the chain followed.
   */
  const resolve = async (
    found: Target,
    seen: string[],
  ): Promise<Record<string, unknown>> => {
    const key = `${found.url.href}#/${found.kind}/${found.name}`;
    if (seen.includes(key)) {
      throw new Error(
        `@untheme/kit: the references loop — ${[...seen, key].join(" → ")}`,
      );
    }
    const root = await read(found.url);
    const map = record(root) ? root[found.kind] : undefined;
    const declared = record(map) ? map[found.name] : undefined;
    if (!record(declared)) {
      throw new Error(
        `@untheme/kit: ${found.url.href} declares no ${one(found.kind)} "${found.name}"`,
      );
    }
    const { $ref, ...own } = declared;
    const body = rebase(own, found.url) as Record<string, unknown>;
    if (typeof $ref !== "string") {
      return body;
    }
    const next = target($ref, found.url);
    if (!next || next.kind !== found.kind) {
      throw new Error(
        `@untheme/kit: ${key} references ${JSON.stringify($ref)}, which is not a ${one(found.kind)}`,
      );
    }
    return { ...(await resolve(next, [...seen, key])), ...body };
  };

  let changed = false;

  for (const kind of ["sets", "modifiers"] as const) {
    const map = document[kind];
    if (!record(map)) {
      continue;
    }
    for (const [name, declared] of Object.entries(map)) {
      if (!record(declared) || typeof declared.$ref !== "string") {
        continue;
      }
      const found = target(declared.$ref, url);
      if (!found || !external(found, url)) {
        continue;
      }
      if (found.kind !== kind) {
        throw new Error(
          `@untheme/kit: ${kind}.${name} references ${JSON.stringify(declared.$ref)}, which is not a ${one(kind)}`,
        );
      }
      map[name] = { ...(await resolve(found, [])), ...overrides(declared) };
      changed = true;
    }
  }

  const order = document.resolutionOrder;
  if (Array.isArray(order)) {
    for (const [at, item] of order.entries()) {
      if (!record(item) || typeof item.$ref !== "string") {
        continue;
      }
      const found = target(item.$ref, url);
      if (!found || !external(found, url)) {
        continue;
      }
      order[at] = {
        type: one(found.kind),
        name: found.name,
        ...(await resolve(found, [])),
        ...overrides(item),
      };
      changed = true;
    }
  }

  return changed ? JSON.stringify(document, null, 2) : src;
};
