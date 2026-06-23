import type { Lexicon, Template } from "./types";

import { COLOR_MODES, CSS_BREAKOUT, SECTIONS } from "./constant";
import {
  balanced,
  breakout,
  container,
  dispatch,
  each,
  filled,
  member,
  shape,
  subset,
  superset,
  text,
} from "./util";

/**
 * Derives a template's runtime {@link Lexicon}: the token-name {@link Set}s and
 * a list of rules per tier, composed from the type-agnostic atoms in `util`.
 * The scalar rule lists double as building blocks — the composite tiers reuse
 * them, since a reference token holds a value, a system token holds a reference
 * name, and a role token holds an alias name.
 *
 * @param base - The template whose keys define the token contract.
 */
export const defineLexicon = <T extends Template>(base: T): Lexicon<T> => {
  const modes = new Set(COLOR_MODES);
  const identity = new Set(SECTIONS);

  const reference = new Set(Object.keys(base.reference));
  const system = new Set([
    ...Object.keys(base.system.light),
    ...Object.keys(base.system.dark),
  ]);
  const role = new Set(Object.keys(base.roles));
  const alias = reference.union(system);
  const all = alias.union(role);

  // Scalar rule lists. They are the tiers' rules and the building blocks the
  // composite tiers reuse: a reference token holds a value, a system token
  // holds a reference name, a role token holds an alias name.
  const value = [
    text("Token value"),
    filled("Token value"),
    breakout("Token value", CSS_BREAKOUT),
    balanced("Token value"),
  ];
  const references = [
    text("Reference token"),
    member("Reference token", reference),
  ];
  const systems = [text("System token"), member("System token", system)];
  const roles = [text("Role token"), member("Role token", role)];
  const aliases = [text("Alias token"), member("Alias token", alias)];
  const tokens = [text("Token"), member("Token", all)];
  const id = [text("Identifier"), filled("Identifier")];
  const name = [text("Name"), filled("Name")];

  return {
    tokens: {
      reference,
      system,
      role,
      alias,
      all,
    },
    rules: {
      mode: [text("Mode"), member("Mode", modes)],
      value,
      reference: references,
      system: systems,
      role: roles,
      alias: aliases,
      token: tokens,
      tokens: [
        container("Tokens"),
        dispatch("Tokens", [
          { set: reference, rules: value },
          { set: system, rules: references },
          { set: role, rules: aliases },
        ]),
      ],
      patch: [
        container("Patch"),
        shape("Patch", {
          reference: [
            container("Reference"),
            subset("Reference", reference),
            each(value),
          ],
          system: [
            container("System"),
            shape("System", {
              light: [
                container("Light"),
                subset("System", system),
                each(references),
              ],
              dark: [
                container("Dark"),
                subset("System", system),
                each(references),
              ],
            }),
          ],
          roles: [container("Roles"), subset("Roles", role), each(aliases)],
        }),
      ],
      layer: [
        container("Layer"),
        shape("Layer", {
          id,
          name,
          reference: [
            container("Reference"),
            subset("Reference", reference),
            each(value),
          ],
          system: [
            container("System"),
            superset("System", modes),
            shape("System", {
              light: [
                container("Light"),
                subset("System", system),
                each(references),
              ],
              dark: [
                container("Dark"),
                subset("System", system),
                each(references),
              ],
            }),
          ],
          roles: [container("Roles"), subset("Roles", role), each(aliases)],
        }),
        superset("Layer", identity),
      ],
      theme: [
        container("Theme"),
        shape("Theme", {
          id,
          name,
          reference: [
            container("Reference"),
            subset("Reference", reference),
            each(value),
            superset("Reference", reference),
          ],
          system: [
            container("System"),
            superset("System", modes),
            shape("System", {
              light: [
                container("Light"),
                subset("System", system),
                each(references),
                superset("System", system),
              ],
              dark: [
                container("Dark"),
                subset("System", system),
                each(references),
                superset("System", system),
              ],
            }),
          ],
          roles: [
            container("Roles"),
            subset("Roles", role),
            each(aliases),
            superset("Roles", role),
          ],
        }),
        superset("Theme", identity),
      ],
    },
  };
};
