/**
 * Raised when a highlight mapping binds a role to a token the contract does not
 * declare, or to a token whose type is not `color`. Carries every offending
 * binding in `problems`, so a whole broken mapping surfaces at once rather than
 * one failure at a time. A lookup/shape miss rather than a schema Issue, so it
 * extends the plain {@link Error}.
 */
export class SyntaxMappingError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`invalid highlight mapping:\n  ${problems.join("\n  ")}`);
    this.name = "SyntaxMappingError";
    this.problems = problems;
  }
}
