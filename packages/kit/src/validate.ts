import type { KitConfig } from "./types";
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
  const issues = [source, identity, outDir].flatMap((rule) => rule(config));
  if (issues.length > 0) {
    throw new InvalidConfigError(issues);
  }
};
