/**
 * The error for a spec that cannot become a theme. The causes are a terse
 * value in no known form, a reference to a token that the spec does not
 * define, a reference cycle with no typed token, or a modifier with no
 * context to boot at. A spec that is well formed but violates the contract
 * fails in the schema instead, with a `SchemaError` that lists every issue.
 */
export class InvalidSpecError extends Error {
  override name = "InvalidSpecError";

  constructor(message: string) {
    super(`@untheme/testing: ${message}`);
  }
}
