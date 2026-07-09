import type { Issue } from "@untheme/schema";

import { SchemaError } from "@untheme/schema";

/**
 * Raised when the base theme handed to {@link defineUntheme} violates its own
 * contract. Extends {@link SchemaError}, so it carries the underlying
 * {@link Issue}s while naming *which* boundary rejected the value.
 */
export class InvalidThemeError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidThemeError";
  }
}

/**
 * Raised when a layer — a registry seed, or an argument to {@link apply} /
 * {@link create} — steps outside the contract. Carries the {@link Issue}s of
 * the failed {@link SchemaError} it wraps.
 */
export class InvalidLayerError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidLayerError";
  }
}

/**
 * Raised when a patch handed to {@link update} steps outside the contract.
 * Carries the {@link Issue}s of the failed {@link SchemaError} it wraps.
 */
export class InvalidPatchError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidPatchError";
  }
}

/**
 * Raised when {@link Untheme.select} is handed a key that names no theme in the
 * registry. Unlike the validation errors above this carries no {@link Issue}s —
 * a missing key is a lookup miss, not a contract violation — so it extends the
 * plain {@link Error} while still giving the failure a semantic identity and
 * the offending `key`.
 */
export class UnknownThemeError extends Error {
  readonly key: string;

  constructor(key: string) {
    super(`no theme registered under "${key}"`);
    this.name = "UnknownThemeError";
    this.key = key;
  }
}

/**
 * Raised when {@link Untheme.contexts} is handed a name the contract declares
 * no modifier under. Like {@link UnknownThemeError} this is a lookup miss, not
 * a contract violation, so it extends the plain {@link Error} while carrying
 * the offending `modifier`.
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
 * Raised when {@link Untheme.resolve} follows an alias chain that loops back on
 * itself. Like {@link UnknownThemeError} it carries no {@link Issue}s — a cycle
 * is a resolution failure, not a contract violation — so it extends the plain
 * {@link Error}, carrying the `chain` of token names up to and including the
 * repeat. Detected by tracking visited tokens, so the stack never overflows.
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
 * Runs `fn`, and if it throws a {@link SchemaError}, re-throws it as the given
 * semantic subclass carrying the same {@link Issue}s; anything else propagates
 * untouched. Lets the service speak in {@link InvalidThemeError} /
 * {@link InvalidLayerError} / {@link InvalidPatchError} while the schema layer
 * stays generic.
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
