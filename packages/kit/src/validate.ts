import type { KitConfig } from "./types";

import { entries, record } from "objectively";

import { OUT_DIR } from "./constant";
import { InvalidConfigError } from "./error";
import { inside, normalize } from "./path";
import { isText } from "./util";

/** One rule over a config. The rule returns the issues that it finds. */
type Rule = (config: KitConfig) => string[];

/** The source is a non-empty path or reference, or a URL. */
const source: Rule = (config) => {
  const { source } = config;
  if (source instanceof URL) {
    return [];
  }
  if (typeof source === "string" && source.trim() !== "") {
    return [];
  }
  return ["source must be a path, a URL, or an npm:/ reference"];
};

/** An identity member, when set, is a non-empty string. */
const identity: Rule = (config) => {
  const issues: string[] = [];
  for (const key of ["id", "name"] as const) {
    const value = config[key];
    if (value === undefined) {
      continue;
    }
    if (typeof value !== "string" || value === "") {
      issues.push(`${key} must be a non-empty string when set`);
    }
  }
  return issues;
};

/** Whether a value is a source designator, a non-empty string or a URL. */
const designator = (value: unknown): boolean => {
  return isText(value) || value instanceof URL;
};

/** Whether a value is a source designator or a non-empty list of them. */
const sources = (value: unknown): boolean => {
  const files: unknown[] = [value].flat();
  return files.length > 0 && files.every(designator);
};

/**
 * Checks each modifier entry. An entry is `false` or an object. `add` maps
 * context names to a source or a list of sources. `contexts` lists at least one
 * context, each a non-empty string and each once. `default` is one of the
 * contexts. The build checks that the names exist after it reads the document.
 */
const modifiers: Rule = (config) => {
  const { modifiers } = config;
  if (modifiers === undefined) {
    return [];
  }
  if (!record(modifiers)) {
    return ["modifiers must be an object of modifier names"];
  }
  const issues: string[] = [];
  for (const [name, change] of entries(modifiers)) {
    const at = `modifiers.${name}`;
    if (change === false) {
      continue;
    }
    if (!record(change)) {
      issues.push(
        `${at} must be false, or an object with add, contexts, or default`,
      );
      continue;
    }
    const { add, contexts, default: boot } = change;
    if (add !== undefined) {
      if (!record(add)) {
        issues.push(`${at}.add must be an object of context names`);
      } else {
        for (const [context, source] of entries(add)) {
          if (!sources(source)) {
            issues.push(
              `${at}.add.${context} must be a path, a URL, or an npm:/ reference, or a list of them`,
            );
          }
        }
      }
    }
    let listed: unknown[] | undefined;
    if (contexts !== undefined) {
      if (
        !Array.isArray(contexts) ||
        contexts.length === 0 ||
        !contexts.every(isText) ||
        new Set(contexts).size !== contexts.length
      ) {
        issues.push(
          `${at}.contexts must list at least one context name, each once`,
        );
      } else {
        listed = contexts;
      }
    }
    if (boot !== undefined && !isText(boot)) {
      issues.push(`${at}.default must be a non-empty string when set`);
    } else if (boot !== undefined && listed && !listed.includes(boot)) {
      issues.push(
        `${at}.default "${boot}" is not one of its contexts (${listed.join(", ")})`,
      );
    }
  }
  return issues;
};

/** The fragment to merge onto the source, when set, is an object. */
const extend: Rule = (config) => {
  if (config.extend === undefined || record(config.extend)) {
    return [];
  }
  return ["extend must be an object: a fragment of the source document"];
};

/**
 * Whether a designator names a local path: a non-empty string with no scheme
 * other than `file:`, or a `file:` URL. A one-letter scheme is a Windows drive.
 */
const local = (value: string | URL): boolean => {
  if (value instanceof URL) {
    return value.protocol === "file:";
  }
  if (value.trim() === "") {
    return false;
  }
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value)?.[1];
  return scheme === undefined || scheme.length === 1 || scheme === "file";
};

/**
 * Checks the layers. The member is a local directory or an object of layer ids.
 * A directory is a path or a `file:` URL. In an object, each id is a non-empty
 * string, and each value is a source or a non-empty list of sources.
 */
const layers: Rule = (config) => {
  const { layers } = config;
  if (layers === undefined) {
    return [];
  }
  if (typeof layers === "string" || layers instanceof URL) {
    if (local(layers)) {
      return [];
    }
    return [
      "layers must be a path to a local directory when it is not an object of layer ids",
    ];
  }
  if (!record(layers)) {
    return [
      "layers must be a path to a local directory, or an object of layer ids",
    ];
  }
  const issues: string[] = [];
  for (const [id, source] of entries(layers)) {
    if (id === "") {
      issues.push("layers has an empty id");
      continue;
    }
    if (!sources(source)) {
      issues.push(
        `layers.${id} must be a path, a URL, or an npm:/ reference, or a list of them`,
      );
    }
  }
  return issues;
};

/** The output directory sits inside the project root. */
const outDir: Rule = (config) => {
  const { outDir = OUT_DIR } = config;
  if (typeof outDir === "string" && inside(normalize(outDir))) {
    return [];
  }
  return [
    `outDir ${JSON.stringify(outDir)} must be a subdirectory of the project root`,
  ];
};

/**
 * Checks a config against every rule that needs no document, and reports all
 * issues together.
 *
 * @param config - The kit config.
 * @throws InvalidConfigError with every issue, when there is any.
 */
export const validate = (config: KitConfig): void => {
  const issues = [source, identity, extend, modifiers, layers, outDir].flatMap(
    (rule) => rule(config),
  );
  if (issues.length > 0) {
    throw new InvalidConfigError(issues);
  }
};
