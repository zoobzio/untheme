import type { Preset, Req } from "./types";

import { record } from "objectively";

import { NPM } from "./constant";
import { entry } from "./describe";
import { isText, rewrite } from "./util";

/** Whether a listed layer has an id. */
const listed = (
  item: unknown,
): item is { id: string; name?: unknown; description?: unknown } => {
  return record(item) && isText(item.id);
};

/**
 * Reads a preset manifest. The layer file of an entry is `layers/<id>.json`
 * beside the manifest.
 *
 * @throws Error when the manifest is malformed.
 */
export const readPreset = async (url: URL, load: Req): Promise<Preset> => {
  let manifest: unknown;
  try {
    manifest = JSON.parse(await load(url, url));
  } catch (error) {
    throw new Error(`@untheme/kit: cannot read the preset at ${url.href}`, {
      cause: error,
    });
  }
  if (
    !record(manifest) ||
    typeof manifest.resolver !== "string" ||
    !Array.isArray(manifest.layers) ||
    !manifest.layers.every(listed)
  ) {
    throw new Error(
      `@untheme/kit: ${url.href} is not a preset manifest — it needs a "resolver" path and a "layers" list`,
    );
  }
  return {
    resolver: new URL(manifest.resolver, url),
    layers: manifest.layers.map((item) => ({
      entry: entry(
        item.id,
        typeof item.name === "string" ? item.name : undefined,
        item.description,
      ),
      url: new URL(`layers/${item.id}.json`, url),
    })),
  };
};

/**
 * Makes each `$ref` of a document portable. A reference to a file of the
 * project becomes an `npm:/` reference into the package.
 *
 * @throws Error when a reference names a file outside the project root.
 */
export const portable = (
  document: Record<string, unknown>,
  source: URL,
  root: URL,
  name: string,
): Record<string, unknown> => {
  return rewrite(document, (ref) => {
    if (ref.startsWith("#")) {
      return ref;
    }
    const located = new URL(ref, source);
    if (located.protocol !== "file:") {
      return located.href;
    }
    if (!located.href.startsWith(root.href)) {
      throw new Error(
        `@untheme/kit: ${located.href} is outside the project root — a preset can reference only the files of its package`,
      );
    }
    return `${NPM}/${name}/${located.href.slice(root.href.length)}`;
  });
};
