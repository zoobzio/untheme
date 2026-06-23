import type { Issue } from "./types";

/** Renders issues into a multi-line message, each prefixed by its path. */
const summarize = (issues: Issue[]): string => {
  const lines = issues.map((issue) => {
    if (issue.path?.length) {
      return `${issue.path.join(".")}: ${issue.message}`;
    }
    return issue.message;
  });
  return lines.join("\n");
};

/**
 * Raised when {@link Parse} or {@link Assert} rejects a value. Carries the
 * concrete {@link Issue}s — each with its own code, message, and path — rather
 * than collapsing them into a single string, so callers can react to every
 * failure individually.
 */
export class SchemaError extends Error {
  readonly issues: Issue[];

  constructor(issues: Issue[]) {
    super(summarize(issues));
    this.name = "SchemaError";
    this.issues = issues;
  }
}
