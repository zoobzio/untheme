import * as z from "zod";
import { cssValue } from "./css";
import { SchemaTokens } from "./types";

/**
 * Builds a bundle of zod schemas for a theme's token contract.
 *
 * Given the reference, system, and role token names as arrays, this returns
 * runtime validators that mirror untheme's three-tier model and enforce the
 * relationships between tiers that the type system expresses with `NoInfer`:
 *
 * - **reference** tokens hold raw CSS values (`cssValue`).
 * - **system** tokens, per mode (`light`/`dark`), must alias a real reference token (`ref`).
 * - **role** tokens must alias a real reference or system token (`ref | sys`).
 *
 * Returns a `theme` validator — a complete theme, every token required — and a
 * `partial` validator — a theme *layer*, where any token present must satisfy
 * its tier's rule but tokens may be omitted (unknown keys and invalid values are
 * still rejected). Use `partial` for layers that get merged into a full theme,
 * then `theme` to confirm the merged result is complete.
 *
 * @param reference - Reference token names.
 * @param system - System token names.
 * @param roles - Role token names.
 * @returns A bundle of zod schemas: token-name enums and structural validators.
 */
export const createUnthemeSchema = <
  const Ref extends string,
  const Sys extends string,
  const Role extends string,
>(
  tokens: SchemaTokens<Ref, Sys, Role>,
) => {
  const ref = z.enum(tokens.ref);
  const sys = z.enum(tokens.sys);
  const role = z.enum(tokens.role);

  const theme = z.object({
    preset: z.string(),
    key: z.string(),
    label: z.string(),
    reference: z.record(ref, cssValue),
    modes: z.object({
      light: z.record(sys, ref),
      dark: z.record(sys, ref),
    }),
    roles: z.record(role, z.union([ref, sys])),
  });

  const partial = z.object({
    preset: z.string(),
    key: z.string(),
    label: z.string(),
    reference: z.partialRecord(ref, cssValue),
    modes: z.object({
      light: z.partialRecord(sys, ref),
      dark: z.partialRecord(sys, ref),
    }),
    roles: z.partialRecord(role, z.union([ref, sys])).optional(),
  });

  return { ref, sys, role, theme, partial };
};
