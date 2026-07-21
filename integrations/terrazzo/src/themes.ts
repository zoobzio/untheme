import type { ConfigInit, ParseOptions } from "@terrazzo/parser";

import { parse } from "@terrazzo/parser";
import { map } from "objectively";
import { delta } from "untheme";

import { binding } from "./convert";
import { identify, locate, request } from "./source";
import type { ThemeSource } from "./types";

/**
 * Parses each theme document into a sparse layer: only the bindings that
 * deviate from the base survive. Documents parse alone with alias resolution
 * off, so references into the base contract stay braced strings; a token the
 * base does not declare is an error — a theme only rebinds, never adds.
 */
export const layers = async (
  entries: ThemeSource[],
  options: {
    config: ConfigInit;
    base: Record<string, unknown>;
    origin: URL;
    req?: ParseOptions["req"];
    logger?: ParseOptions["logger"];
  },
): Promise<Record<string, Record<string, unknown>>> => {
  const catalog: Record<string, Record<string, unknown>> = {};
  for (const entry of entries) {
    const url = locate(entry.source, options.origin);
    let src: string;
    if (options.req) {
      src = await options.req(url, options.origin);
    } else {
      src = await request(url);
    }
    const parsed = await parse([{ filename: url, src }], {
      config: options.config,
      req: options.req,
      logger: options.logger,
      skipLint: true,
      resolveAliases: false,
    });
    const { id, name } = identify(entry, url);
    if (id in catalog) {
      throw new Error(
        `untheme terrazzo: two theme documents share the id "${id}" — set distinct ids on the theme entries`,
      );
    }
    const alien = Object.keys(parsed.tokens).filter(
      (key) => !(key in options.base),
    );
    if (alien.length > 0) {
      throw new Error(
        `untheme terrazzo: theme "${id}" (${url.href}) defines tokens missing from the base contract: ${alien.join(", ")} — a theme only rebinds, never adds`,
      );
    }
    const overrides = delta(options.base, map(parsed.tokens, binding));
    const layer: Record<string, unknown> = { id, name };
    if (Object.keys(overrides).length > 0) {
      layer.tokens = overrides;
    }
    catalog[id] = layer;
  }
  return catalog;
};
