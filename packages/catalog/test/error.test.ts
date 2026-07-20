import type { Issue } from "@untheme/schema";

import { SchemaError } from "@untheme/schema";
import { describe, it, expect } from "vitest";

import {
  FailedRequestError,
  MalformedLayerError,
  MalformedPageError,
  MalformedQueryError,
} from "../src/error";

/* One concrete issue to exercise the SchemaError family. */
const issues: Issue[] = [
  { code: "unknown_key", message: "ghost is not in the contract" },
];

describe("MalformedQueryError", () => {
  it("names the failure and carries the offending value", () => {
    const error = new MalformedQueryError({ ghost: true });

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(SchemaError);
    expect(error.name).toBe("MalformedQueryError");
    expect(error.value).toEqual({ ghost: true });
  });
});

describe("MalformedPageError", () => {
  it("names the failure and carries the offending value", () => {
    const error = new MalformedPageError("everything");

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(SchemaError);
    expect(error.name).toBe("MalformedPageError");
    expect(error.value).toBe("everything");
  });
});

describe("MalformedLayerError", () => {
  it("is a SchemaError carrying the issues and the retrieved id", () => {
    const error = new MalformedLayerError("corrupt", issues);

    expect(error).toBeInstanceOf(SchemaError);
    expect(error.name).toBe("MalformedLayerError");
    expect(error.id).toBe("corrupt");
    expect(error.issues).toBe(issues);
  });
});

describe("FailedRequestError", () => {
  it("carries the url and status, rendering both into the message", () => {
    const error = new FailedRequestError("https://themes.test/themes", 503);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(SchemaError);
    expect(error.name).toBe("FailedRequestError");
    expect(error.url).toBe("https://themes.test/themes");
    expect(error.status).toBe(503);
    expect(error.message).toBe(
      'request to "https://themes.test/themes" failed with status 503',
    );
  });
});
