import type { Issue } from "@untheme/schema";

import { SchemaError } from "@untheme/schema";

/**
 * The error for a base theme that violates its own contract. The theme is the
 * argument of {@link makeUntheme}. The error extends {@link SchemaError} and
 * holds the {@link Issue}s.
 */
export class InvalidThemeError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidThemeError";
  }
}

/**
 * The error for a layer that violates the contract. The layer is the argument
 * of `apply` or `create`. The error extends {@link SchemaError} and holds the
 * {@link Issue}s.
 */
export class InvalidLayerError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidLayerError";
  }
}

/**
 * The error for a patch that violates the contract. The patch is the argument
 * of `update`. The error extends {@link SchemaError} and holds the
 * {@link Issue}s.
 */
export class InvalidPatchError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidPatchError";
  }
}

/**
 * The error for a name that is not a modifier of the contract.
 * {@link Untheme.contexts} throws it. The error extends {@link Error}. The
 * `modifier` property holds the name.
 */
export class UnknownModifierError extends Error {
  readonly modifier: string;

  constructor(modifier: string) {
    super(`no modifier declared under "${modifier}"`);
    this.name = "UnknownModifierError";
    this.modifier = modifier;
  }
}

/**
 * The error for an alias chain that returns to a token in the chain.
 * {@link Untheme.resolve} throws it. The error extends {@link Error}. The
 * `chain` property holds the token names, up to and including the repeated
 * token.
 */
export class CircularAliasError extends Error {
  readonly chain: string[];

  constructor(chain: string[]) {
    super(`alias chain loops: ${chain.join(" → ")}`);
    this.name = "CircularAliasError";
    this.chain = chain;
  }
}

/**
 * Runs `fn`. If `fn` throws a {@link SchemaError}, the function throws a new
 * `Semantic` error with the same {@link Issue}s. The function passes all other
 * errors on. The service uses it to throw {@link InvalidThemeError},
 * {@link InvalidLayerError}, and {@link InvalidPatchError}.
 */
export const reframe = <T>(
  Semantic: new (issues: Issue[]) => SchemaError,
  fn: () => T,
): T => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof SchemaError) {
      throw new Semantic(error.issues);
    }
    throw error;
  }
};
