import type { KitConfig, LayerSources } from "./types";

import { record } from "objectively";

import { NPM, OUT_DIR } from "./constant";
import { InvalidConfigError } from "./error";
import { inside, normalize } from "./path";

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

/** Whether a value is a non-empty string. */
const named = (value: unknown): value is string => {
  return typeof value === "string" && value !== "";
};

/** Whether a value is a source designator, a non-empty string or a URL. */
const designator = (value: unknown): boolean => {
  return named(value) || value instanceof URL;
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
  for (const [name, change] of Object.entries(modifiers)) {
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
        for (const [context, source] of Object.entries(add)) {
          const files: unknown[] = [source].flat();
          if (files.length === 0 || !files.every(designator)) {
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
        !contexts.every(named) ||
        new Set(contexts).size !== contexts.length
      ) {
        issues.push(
          `${at}.contexts must list at least one context name, each once`,
        );
      } else {
        listed = contexts;
      }
    }
    if (boot !== undefined && !named(boot)) {
      issues.push(`${at}.default must be a non-empty string when set`);
    } else if (boot !== undefined && listed && !listed.includes(boot)) {
      issues.push(
        `${at}.default "${boot}" is not one of its contexts (${listed.join(", ")})`,
      );
    }
  }
  return issues;
};

/**
 * Whether a designator can name a directory to list: a non-empty string with
 * no scheme other than `file:` or `npm:`, or a `file:` or `npm:` URL. A
 * one-letter scheme is a Windows drive.
 */
const listable = (value: string | URL): boolean => {
  if (value instanceof URL) {
    return value.protocol === "file:" || value.protocol === NPM;
  }
  if (value.trim() === "") {
    return false;
  }
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value)?.[1];
  return (
    scheme === undefined ||
    scheme.length === 1 ||
    scheme === "file" ||
    `${scheme}:` === NPM
  );
};

const DIRECTORY =
  "a path, a file: URL, or an npm:/ reference to a directory, or an object of layer ids";

/**
 * Checks one source of layers. A directory is a path, a `file:` URL, or an
 * `npm:/` reference. In an object, each id is a non-empty string, and each
 * value is a source or a non-empty list of sources.
 */
const source_ = (at: string, layers: LayerSources): string[] => {
  if (typeof layers === "string" || layers instanceof URL) {
    if (listable(layers)) {
      return [];
    }
    return [`${at} must be ${DIRECTORY}`];
  }
  if (!record(layers)) {
    return [`${at} must be ${DIRECTORY}`];
  }
  const issues: string[] = [];
  for (const [id, source] of Object.entries(layers)) {
    if (id === "") {
      issues.push(`${at} has an empty id`);
      continue;
    }
    const files: unknown[] = [source].flat();
    if (files.length === 0 || !files.every(designator)) {
      issues.push(
        `${at}.${id} must be a path, a URL, or an npm:/ reference, or a list of them`,
      );
    }
  }
  return issues;
};

/**
 * Checks the layers. The member is one source of layers or a list of them. The
 * build checks that each id appears once after it lists the directories.
 */
const layers: Rule = (config) => {
  const { layers } = config;
  if (layers === undefined) {
    return [];
  }
  if (Array.isArray(layers)) {
    if (layers.length === 0) {
      return ["layers must list at least one source of layers"];
    }
    return layers.flatMap((item, index) =>
      source_(`layers[${index}]`, item as LayerSources),
    );
  }
  return source_("layers", layers);
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
  const issues = [source, identity, modifiers, layers, outDir].flatMap((rule) =>
    rule(config),
  );
  if (issues.length > 0) {
    throw new InvalidConfigError(issues);
  }
};
