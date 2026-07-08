import { describe, expect, it } from "vitest";

import { entries, keys, map, reduce, remap, values } from "../src/object";

const subject = {
  color: "{brand}",
  size: 4,
  active: true,
};

describe("keys", () => {
  it("returns the object's own keys", () => {
    expect(keys(subject)).toEqual(["color", "size", "active"]);
  });

  it("types each key to the key union", () => {
    const named: ("color" | "size" | "active")[] = keys(subject);
    expect(named).toHaveLength(3);
  });
});

describe("values", () => {
  it("returns the object's own values", () => {
    expect(values(subject)).toEqual(["{brand}", 4, true]);
  });

  it("types each value to the value union", () => {
    const valued: (string | number | boolean)[] = values(subject);
    expect(valued).toHaveLength(3);
  });
});

describe("entries", () => {
  it("returns the object's own pairs", () => {
    expect(entries(subject)).toEqual([
      ["color", "{brand}"],
      ["size", 4],
      ["active", true],
    ]);
  });

  it("keeps each key paired with its own value type", () => {
    for (const [key, value] of entries(subject)) {
      if (key === "size") {
        const num: number = value;
        expect(num).toBe(4);
      }
    }
  });
});

describe("reduce", () => {
  it("folds the entries into the accumulator", () => {
    const joined = reduce(
      subject,
      (acc, key, value) => `${acc}${key}=${String(value)};`,
      "",
    );
    expect(joined).toBe("color={brand};size=4;active=true;");
  });

  it("returns the seed for an empty object", () => {
    expect(reduce({}, (acc) => acc, 0)).toBe(0);
  });
});

describe("map", () => {
  it("maps every value and preserves the keys", () => {
    const stringified = map(subject, (value) => String(value));
    expect(stringified).toEqual({
      color: "{brand}",
      size: "4",
      active: "true",
    });
  });

  it("hands the callback the key alongside the value", () => {
    const keyed = map(subject, (_, key) => key);
    expect(keyed).toEqual({
      color: "color",
      size: "size",
      active: "active",
    });
  });
});

describe("remap", () => {
  it("rebuilds values into the named result shape", () => {
    const source = { a: 1, b: 2 };
    const result = remap<typeof source, { a: string; b: string }>(
      source,
      (value) => String(value),
    );
    expect(result).toEqual({ a: "1", b: "2" });
  });

  it("builds a result whose value type varies per key", () => {
    const source = { mode: { light: 1, dark: 2 }, density: { compact: 3 } };
    type Names = {
      [K in keyof typeof source]: (keyof (typeof source)[K] & string)[];
    };

    const names = <K extends keyof typeof source & string>(
      value: (typeof source)[K],
    ): (keyof (typeof source)[K] & string)[] => keys(value);

    const result = remap<typeof source, Names>(source, names);
    const mode: ("light" | "dark")[] = result.mode;
    const density: "compact"[] = result.density;
    expect(mode).toEqual(["light", "dark"]);
    expect(density).toEqual(["compact"]);
  });
});
