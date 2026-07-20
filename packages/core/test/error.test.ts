import type { Issue } from "@untheme/schema";

import { SchemaError } from "@untheme/schema";
import { describe, it, expect } from "vitest";

import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownModifierError,
  reframe,
} from "../src/error";

/* Two concrete issues, one carrying a path, to exercise message rendering. */
const issues: Issue[] = [
  { code: "missing_key", message: "color.fg is required", path: ["color.fg"] },
  { code: "unknown_key", message: "color.extra is not in the contract" },
];

describe("InvalidThemeError", () => {
  it("is a SchemaError carrying the wrapped issues", () => {
    const error = new InvalidThemeError(issues);

    expect(error).toBeInstanceOf(SchemaError);
    expect(error.name).toBe("InvalidThemeError");
    expect(error.issues).toBe(issues);
  });

  it("renders every issue into the message, prefixing paths", () => {
    const error = new InvalidThemeError(issues);

    expect(error.message).toBe(
      "color.fg: color.fg is required\ncolor.extra is not in the contract",
    );
  });
});

describe("InvalidLayerError", () => {
  it("is a SchemaError carrying the wrapped issues", () => {
    const error = new InvalidLayerError(issues);

    expect(error).toBeInstanceOf(SchemaError);
    expect(error.name).toBe("InvalidLayerError");
    expect(error.issues).toBe(issues);
  });
});

describe("InvalidPatchError", () => {
  it("is a SchemaError carrying the wrapped issues", () => {
    const error = new InvalidPatchError(issues);

    expect(error).toBeInstanceOf(SchemaError);
    expect(error.name).toBe("InvalidPatchError");
    expect(error.issues).toBe(issues);
  });
});

describe("UnknownModifierError", () => {
  it("names the missing modifier without carrying issues", () => {
    const error = new UnknownModifierError("ghost");

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(SchemaError);
    expect(error.name).toBe("UnknownModifierError");
    expect(error.modifier).toBe("ghost");
    expect(error.message).toBe('no modifier declared under "ghost"');
  });
});

describe("CircularAliasError", () => {
  it("carries the looping chain and renders it into the message", () => {
    const chain = ["color.a", "color.b", "color.a"];
    const error = new CircularAliasError(chain);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(SchemaError);
    expect(error.name).toBe("CircularAliasError");
    expect(error.chain).toBe(chain);
    expect(error.message).toBe(
      "alias chain loops: color.a → color.b → color.a",
    );
  });
});

describe("reframe", () => {
  it("returns the result when the function does not throw", () => {
    expect(reframe(InvalidThemeError, () => 42)).toBe(42);
  });

  it("re-throws a SchemaError as the given subclass, preserving issues", () => {
    const run = () => {
      reframe(InvalidLayerError, () => {
        throw new SchemaError(issues);
      });
    };

    expect(run).toThrow(InvalidLayerError);
    try {
      run();
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidLayerError);
      if (error instanceof InvalidLayerError) {
        expect(error.issues).toBe(issues);
      }
    }
  });

  it("lets a non-SchemaError propagate untouched", () => {
    const boom = new TypeError("unrelated");

    expect(() =>
      reframe(InvalidPatchError, () => {
        throw boom;
      }),
    ).toThrow(boom);
  });
});
