import type { KitConfig } from "./types";

import { record } from "objectively";

import { OUT_DIR } from "./constant";
import { InvalidConfigError } from "./error";
import { inside, normalize } from "./path";

/** One rule over a config: every issue it finds, none when the config passes. */
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

/** A non-empty string. */
const named = (value: unknown): value is string => {
  return typeof value === "string" && value !== "";
};

/** A source designator: a non-empty string or a URL. */
const designator = (value: unknown): boolean => {
  return named(value) || value instanceof URL;
};

/**
 * Each modifier entry is `false` or an object. Its `add` maps context names
 * to a source or a list of them; its `contexts` lists at least one context —
 * every one a non-empty string, none twice; its `default` is one it keeps.
 * Whether the names exist is decided once the document is read.
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
 * Checks a config against every rule that can be decided without reading a
 * document, and reports all of the issues together.
 *
 * @param config - The kit config.
 * @throws InvalidConfigError carrying every issue, when there is any.
 */
export const validate = (config: KitConfig): void => {
  const issues = [source, identity, modifiers, outDir].flatMap((rule) =>
    rule(config),
  );
  if (issues.length > 0) {
    throw new InvalidConfigError(issues);
  }
};
