import { describe, expect, it } from "vitest";

import { SchemaError } from "../src/error";
import type { Issue } from "../src/types";

const issue = (over: Partial<Issue>): Issue => ({
  code: "not_string",
  message: "must be a string.",
  ...over,
});

describe("SchemaError", () => {
  it("is an Error named SchemaError", () => {
    const error = new SchemaError([issue({})]);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("SchemaError");
  });

  it("carries the issues it was constructed with", () => {
    const issues = [issue({ message: "one" }), issue({ message: "two" })];
    const error = new SchemaError(issues);
    expect(error.issues).toBe(issues);
    expect(error.issues).toHaveLength(2);
  });

  it("summarizes issues into a multi-line message", () => {
    const error = new SchemaError([
      issue({ message: "one" }),
      issue({ message: "two" }),
    ]);
    expect(error.message).toBe("one\ntwo");
  });

  it("prefixes a message with its dotted path when present", () => {
    const error = new SchemaError([
      issue({ message: "bad", path: ["mode", "dark", "color.fg"] }),
    ]);
    expect(error.message).toBe("mode.dark.color.fg: bad");
  });

  it("omits the prefix when the path is empty or absent", () => {
    const error = new SchemaError([
      issue({ message: "no-path" }),
      issue({ message: "empty-path", path: [] }),
    ]);
    expect(error.message).toBe("no-path\nempty-path");
  });

  it("produces an empty message for no issues", () => {
    const error = new SchemaError([]);
    expect(error.message).toBe("");
    expect(error.issues).toEqual([]);
  });
});
