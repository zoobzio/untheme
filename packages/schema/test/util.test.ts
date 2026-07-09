import { describe, expect, it } from "vitest";

import type { Rule } from "../src/types";
import {
  acyclic,
  all,
  breakout,
  collectRefs,
  container,
  each,
  either,
  exhaustive,
  fields,
  filled,
  hexColor,
  keyed,
  keys,
  known,
  list,
  member,
  mismatch,
  nest,
  numeric,
  range,
  reference,
  referenceType,
  struct,
  subset,
  superset,
  target,
  text,
  unique,
  valued,
} from "../src/util";

/* A rule that always passes, and one that always fails with a marker code. */
const pass: Rule = () => undefined;
const fail: Rule = (v) => ({ code: "no_match", message: "nope", received: v });

describe("nest", () => {
  it("prefixes an issue's path with the key", () => {
    const nested = nest("outer", { code: "empty", message: "m", path: ["in"] });
    expect(nested.path).toEqual(["outer", "in"]);
  });

  it("starts a path when the issue has none", () => {
    expect(nest("key", { code: "empty", message: "m" }).path).toEqual(["key"]);
  });

  it("preserves the rest of the issue", () => {
    const nested = nest("k", {
      code: "not_number",
      message: "m",
      received: 5,
    });
    expect(nested.code).toBe("not_number");
    expect(nested.received).toBe(5);
  });
});

describe("target", () => {
  it("extracts the name from a braced reference", () => {
    expect(target("{color.bg}")).toBe("color.bg");
  });

  it("returns the empty name for the empty braces", () => {
    expect(target("{}")).toBe("");
  });

  it("returns undefined for non-references", () => {
    expect(target("color.bg")).toBeUndefined();
    expect(target("{open")).toBeUndefined();
    expect(target("close}")).toBeUndefined();
    expect(target(42)).toBeUndefined();
    expect(target(null)).toBeUndefined();
  });
});

describe("collectRefs", () => {
  it("returns a single-name array for a reference", () => {
    expect(collectRefs("{a}")).toEqual(["a"]);
  });

  it("walks arrays and objects", () => {
    expect(collectRefs(["{a}", "{b}"])).toEqual(["a", "b"]);
    expect(collectRefs({ x: "{a}", y: { z: "{b}" } })).toEqual(["a", "b"]);
  });

  it("returns nothing for plain values", () => {
    expect(collectRefs("plain")).toEqual([]);
    expect(collectRefs(42)).toEqual([]);
    expect(collectRefs(null)).toEqual([]);
  });

  it("gathers references nested inside composite structures", () => {
    const value = {
      color: "{color.fg}",
      offsets: [{ x: "{space.sm}" }, 3],
    };
    expect(collectRefs(value)).toEqual(["color.fg", "space.sm"]);
  });
});

describe("text", () => {
  it("passes strings, fails non-strings", () => {
    expect(text("N")("hi")).toBeUndefined();
    const issue = text("N")(5);
    expect(issue?.code).toBe("not_string");
    expect(issue?.message).toBe("N must be a string.");
    expect(issue?.received).toBe(5);
  });
});

describe("filled", () => {
  it("fails a blank string", () => {
    expect(filled("N")("   ")?.code).toBe("empty");
    expect(filled("N")("")?.code).toBe("empty");
  });

  it("passes a non-empty string", () => {
    expect(filled("N")("x")).toBeUndefined();
  });

  it("passes non-strings untouched", () => {
    expect(filled("N")(5)).toBeUndefined();
    expect(filled("N")(null)).toBeUndefined();
  });
});

describe("breakout", () => {
  const rule = breakout("N", /[;{}]|url\(/i);

  it("fails a string matching the pattern", () => {
    const issue = rule("a;b");
    expect(issue?.code).toBe("css_breakout");
    expect(issue?.expected).toBe("[;{}]|url\\(");
  });

  it("passes a clean string", () => {
    expect(rule("clean")).toBeUndefined();
  });

  it("passes non-strings untouched", () => {
    expect(rule(5)).toBeUndefined();
  });
});

describe("hexColor", () => {
  const rule = hexColor("N");

  it("passes each hex digit count and non-strings", () => {
    expect(rule("#abc")).toBeUndefined();
    expect(rule("#abcd")).toBeUndefined();
    expect(rule("#AbCdEf")).toBeUndefined();
    expect(rule("#abcdef01")).toBeUndefined();
    expect(rule(5)).toBeUndefined();
  });

  it("fails a missing '#', a bad length, and non-hex characters", () => {
    expect(rule("abcdef")?.code).toBe("not_hex");
    expect(rule("#abcde")?.code).toBe("not_hex");
    expect(rule("#xyzxyz")?.code).toBe("not_hex");
    expect(rule(";} body { background: url(evil) }")?.code).toBe("not_hex");
  });
});

describe("member", () => {
  const rule = member("N", new Set(["a", "b"]));

  it("passes a member", () => {
    expect(rule("a")).toBeUndefined();
  });

  it("fails a non-member and a non-string", () => {
    expect(rule("c")?.code).toBe("not_member");
    const issue = rule(5);
    expect(issue?.code).toBe("not_member");
    expect(issue?.expected).toEqual(["a", "b"]);
  });
});

describe("numeric", () => {
  it("passes a finite number", () => {
    expect(numeric("N")(1.5)).toBeUndefined();
    expect(numeric("N")(0)).toBeUndefined();
  });

  it("fails non-numbers and non-finite numbers", () => {
    expect(numeric("N")("1")?.code).toBe("not_number");
    expect(numeric("N")(NaN)?.code).toBe("not_number");
    expect(numeric("N")(Infinity)?.code).toBe("not_number");
  });
});

describe("range", () => {
  const rule = range("N", 0, 1);

  it("passes an in-range number and the bounds", () => {
    expect(rule(0)).toBeUndefined();
    expect(rule(1)).toBeUndefined();
    expect(rule(0.5)).toBeUndefined();
  });

  it("fails an out-of-range number", () => {
    expect(rule(-1)?.code).toBe("out_of_range");
    const issue = rule(2);
    expect(issue?.code).toBe("out_of_range");
    expect(issue?.expected).toEqual([0, 1]);
  });

  it("passes non-numbers untouched", () => {
    expect(rule("x")).toBeUndefined();
  });
});

describe("mismatch", () => {
  const rule = mismatch("thing", (v) => typeof v === "number");

  it("passes when the predicate accepts", () => {
    expect(rule(5)).toBeUndefined();
  });

  it("fails when the predicate rejects", () => {
    const issue = rule("x");
    expect(issue?.code).toBe("type_mismatch");
    expect(issue?.message).toBe("thing is not a valid thing.");
  });
});

describe("known", () => {
  const rule = known("N", new Set(["color", "dimension"]));

  it("passes a known type", () => {
    expect(rule("color")).toBeUndefined();
  });

  it("fails an unknown type or non-string", () => {
    expect(rule("colour")?.code).toBe("unknown_type");
    expect(rule(5)?.code).toBe("unknown_type");
  });
});

describe("reference", () => {
  const rule = reference("N", new Set(["a", "b"]));

  it("passes a braced reference to a known token", () => {
    expect(rule("{a}")).toBeUndefined();
  });

  it("fails a reference to an unknown token", () => {
    expect(rule("{ghost}")?.code).toBe("not_reference");
  });

  it("fails an unbraced string and a non-string", () => {
    expect(rule("a")?.code).toBe("not_reference");
    expect(rule(5)?.code).toBe("not_reference");
  });
});

describe("referenceType", () => {
  const types = { fg: "color", sm: "dimension" };
  const rule = referenceType("N", types, "color");

  it("passes a reference to a same-type token", () => {
    expect(rule("{fg}")).toBeUndefined();
  });

  it("fails a reference to a different-type token", () => {
    const issue = rule("{sm}");
    expect(issue?.code).toBe("type_mismatch");
    expect(issue?.expected).toBe("color");
  });

  it("passes when the value is not a reference", () => {
    expect(rule("plain")).toBeUndefined();
    expect(rule(5)).toBeUndefined();
  });

  it("passes when the referenced token has no known type", () => {
    expect(rule("{unknown}")).toBeUndefined();
  });
});

describe("container", () => {
  it("passes a plain object", () => {
    expect(container("N")({})).toBeUndefined();
  });

  it("fails non-objects", () => {
    expect(container("N")([])?.code).toBe("not_object");
    expect(container("N")("x")?.code).toBe("not_object");
    expect(container("N")(null)?.code).toBe("not_object");
  });
});

describe("all", () => {
  it("returns the first issue and short-circuits", () => {
    let reached = false;
    const late: Rule = () => {
      reached = true;
      return undefined;
    };
    const issue = all([pass, fail, late])(1);
    expect(issue?.code).toBe("no_match");
    expect(reached).toBe(false);
  });

  it("passes when every rule passes", () => {
    expect(all([pass, pass])(1)).toBeUndefined();
  });
});

describe("valued", () => {
  it("dispatches a braced string to the reference rule", () => {
    const seen: string[] = [];
    const asReference: Rule = () => {
      seen.push("ref");
      return undefined;
    };
    const asLiteral: Rule = () => {
      seen.push("lit");
      return undefined;
    };
    valued(asReference, asLiteral)("{a}");
    expect(seen).toEqual(["ref"]);
  });

  it("dispatches anything else to the literal rule", () => {
    const seen: string[] = [];
    const asReference: Rule = () => {
      seen.push("ref");
      return undefined;
    };
    const asLiteral: Rule = () => {
      seen.push("lit");
      return undefined;
    };
    const check = valued(asReference, asLiteral);
    check({ colorSpace: "srgb" });
    check("plain");
    check("{open");
    expect(seen).toEqual(["lit", "lit", "lit"]);
  });
});

describe("either", () => {
  const rule = either("N", [[numeric("num")], [text("str"), filled("str")]]);

  it("passes when any branch fully passes", () => {
    expect(rule(5)).toBeUndefined();
    expect(rule("hi")).toBeUndefined();
  });

  it("fails when no branch passes", () => {
    const issue = rule(true);
    expect(issue?.code).toBe("no_match");
    expect(issue?.message).toBe("N did not match any allowed form.");
  });
});

describe("subset", () => {
  const rule = subset("N", new Set(["a", "b"]));

  it("passes when every key is allowed", () => {
    expect(rule({ a: 1 })).toBeUndefined();
    expect(rule({})).toBeUndefined();
  });

  it("fails the first unknown key with its path", () => {
    const issue = rule({ a: 1, ghost: 2 });
    expect(issue?.code).toBe("unknown_key");
    expect(issue?.path).toEqual(["ghost"]);
  });

  it("passes non-records untouched", () => {
    expect(rule("x")).toBeUndefined();
  });
});

describe("superset", () => {
  const rule = superset("N", new Set(["a", "b"]));

  it("passes when every required key is present", () => {
    expect(rule({ a: 1, b: 2, extra: 3 })).toBeUndefined();
  });

  it("fails a missing required key with its path", () => {
    const issue = rule({ a: 1 });
    expect(issue?.code).toBe("missing_key");
    expect(issue?.path).toEqual(["b"]);
  });

  it("passes non-records untouched", () => {
    expect(rule("x")).toBeUndefined();
  });
});

describe("unique", () => {
  const rule = unique("N");

  it("passes distinct elements and non-arrays", () => {
    expect(rule(["a", "b"])).toBeUndefined();
    expect(rule([])).toBeUndefined();
    expect(rule("a")).toBeUndefined();
  });

  it("fails a repeated element, under its index", () => {
    const issue = rule(["a", "b", "a"]);
    expect(issue?.code).toBe("duplicate");
    expect(issue?.path).toEqual(["2"]);
  });
});

describe("exhaustive", () => {
  const rule = exhaustive("N", new Set(["a", "b"]));

  it("passes an array carrying every member, and non-arrays", () => {
    expect(rule(["b", "a"])).toBeUndefined();
    expect(rule(["a", "b", "c"])).toBeUndefined();
    expect(rule(5)).toBeUndefined();
  });

  it("fails when a member is missing", () => {
    const issue = rule(["a"]);
    expect(issue?.code).toBe("not_exhaustive");
    expect(issue?.expected).toEqual(["a", "b"]);
  });
});

describe("list", () => {
  const rule = list("N", [numeric("num")]);

  it("passes an array whose elements all pass", () => {
    expect(rule([1, 2, 3])).toBeUndefined();
  });

  it("fails a non-array", () => {
    expect(rule("x")?.code).toBe("not_array");
  });

  it("nests the failing element's index into the path", () => {
    const issue = rule([1, "bad", 3]);
    expect(issue?.code).toBe("not_number");
    expect(issue?.path).toEqual(["1"]);
  });
});

describe("each", () => {
  const rule = each([numeric("num")]);

  it("applies rules to every value and nests the failing key", () => {
    expect(rule({ a: 1, b: 2 })).toBeUndefined();
    const issue = rule({ a: 1, b: "bad" });
    expect(issue?.code).toBe("not_number");
    expect(issue?.path).toEqual(["b"]);
  });

  it("passes non-records untouched", () => {
    expect(rule("x")).toBeUndefined();
  });
});

describe("keyed", () => {
  const rule = keyed((key) => (key === "n" ? [numeric("num")] : [text("str")]));

  it("picks the rule set per key", () => {
    expect(rule({ n: 1, s: "hi" })).toBeUndefined();
    expect(rule({ n: "bad" })?.code).toBe("not_number");
    expect(rule({ s: 5 })?.code).toBe("not_string");
  });

  it("passes non-records untouched", () => {
    expect(rule(5)).toBeUndefined();
  });
});

describe("keys", () => {
  const rule = keys("Name", [filled("Key")]);

  it("applies rules to every key and prefixes the message", () => {
    const issue = rule({ "": 1 });
    expect(issue?.code).toBe("empty");
    expect(issue?.message).toBe("Name: Key must not be empty.");
    expect(issue?.path).toEqual([""]);
  });

  it("passes when every key satisfies the rules", () => {
    expect(rule({ a: 1, b: 2 })).toBeUndefined();
  });

  it("passes non-records untouched", () => {
    expect(rule(5)).toBeUndefined();
  });
});

describe("fields", () => {
  const rule = fields("N", { a: [numeric("a")], b: [text("b")] });

  it("passes a record of known fields that satisfy their rules", () => {
    expect(rule({ a: 1, b: "x" })).toBeUndefined();
  });

  it("does not require optional fields to be present", () => {
    expect(rule({ a: 1 })).toBeUndefined();
    expect(rule({})).toBeUndefined();
  });

  it("rejects an unknown key", () => {
    const issue = rule({ a: 1, ghost: 2 });
    expect(issue?.code).toBe("unknown_key");
    expect(issue?.path).toEqual(["ghost"]);
  });

  it("nests a failing field's key into the path", () => {
    const issue = rule({ a: "bad" });
    expect(issue?.code).toBe("not_number");
    expect(issue?.path).toEqual(["a"]);
  });

  it("passes non-records untouched", () => {
    expect(rule(5)).toBeUndefined();
  });
});

describe("struct", () => {
  const rule = struct(
    "N",
    { a: [numeric("a")], b: [text("b")] },
    new Set(["a", "b"]),
  );

  it("passes a well-formed struct", () => {
    expect(rule({ a: 1, b: "x" })).toBeUndefined();
  });

  it("rejects unknown keys before checking required keys", () => {
    expect(rule({ a: 1, b: "x", ghost: 2 })?.code).toBe("unknown_key");
  });

  it("reports a missing required key", () => {
    const issue = rule({ a: 1 });
    expect(issue?.code).toBe("missing_key");
    expect(issue?.path).toEqual(["b"]);
  });
});

describe("acyclic", () => {
  const edges = (entry: unknown): string[] => collectRefs(entry);

  it("passes a graph with no cycle", () => {
    const rule = acyclic("G", new Set(["a", "b", "c"]), edges);
    expect(rule({ a: "{b}", b: "{c}", c: 1 })).toBeUndefined();
  });

  it("catches a direct self-cycle", () => {
    const rule = acyclic("G", new Set(["a"]), edges);
    const issue = rule({ a: "{a}" });
    expect(issue?.code).toBe("cycle");
    expect(issue?.path).toEqual(["a"]);
    expect(issue?.message).toContain("a → a");
  });

  it("catches a longer cycle a→b→a", () => {
    const rule = acyclic("G", new Set(["a", "b"]), edges);
    const issue = rule({ a: "{b}", b: "{a}" });
    expect(issue?.code).toBe("cycle");
  });

  it("ignores references to tokens outside the set", () => {
    const rule = acyclic("G", new Set(["a"]), edges);
    expect(rule({ a: "{ghost}" })).toBeUndefined();
  });

  it("passes non-records untouched", () => {
    const rule = acyclic("G", new Set(["a"]), edges);
    expect(rule("x")).toBeUndefined();
  });
});
