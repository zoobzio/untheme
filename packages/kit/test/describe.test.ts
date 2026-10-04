import { describe as suite, expect, it } from "vitest";

import { assemble } from "../src/assemble";
import { describe, title } from "../src/describe";
import { inline, load } from "./helpers";

suite("title", () => {
  it("capitalizes the words of an id", () => {
    expect(title("night_owl")).toBe("Night Owl");
    expect(title("rose-pine")).toBe("Rose Pine");
    expect(title("color.mode")).toBe("Color Mode");
    expect(title("md")).toBe("Md");
  });
});

suite("describe", () => {
  it("names every modifier and context by its titled id when nothing is authored", async () => {
    const { parsed } = await load("resolver.json");
    const { manifest } = assemble(parsed, {});
    expect(manifest).toEqual([
      {
        id: "color",
        name: "Color",
        contexts: [
          { id: "light", name: "Light" },
          { id: "dark", name: "Dark" },
        ],
      },
      {
        id: "density",
        name: "Density",
        contexts: [
          { id: "default", name: "Default" },
          { id: "compact", name: "Compact" },
        ],
      },
    ]);
  });

  it("reads names and descriptions off the modifier and its context sources", async () => {
    const parsed = await inline("described.resolver.json", {
      name: "Described",
      version: "2025.10",
      sets: {
        core: { sources: [{ size: { $type: "number", $value: 1 } }] },
      },
      modifiers: {
        scale: {
          description: "How large everything is.",
          $extensions: { "io.zoobz.untheme": { name: "Size" } },
          contexts: {
            regular: [{}],
            xl: [
              {
                $description: "Twice the size.",
                $extensions: { "io.zoobz.untheme": { name: "Extra Large" } },
                size: { $type: "number", $value: 2 },
              },
              { $description: "The last source wins." },
            ],
          },
          default: "regular",
        },
      },
      resolutionOrder: [{ $ref: "#/sets/core" }, { $ref: "#/modifiers/scale" }],
    });
    const { theme, manifest } = assemble(parsed, {});
    expect(manifest).toEqual([
      {
        id: "scale",
        name: "Size",
        description: "How large everything is.",
        contexts: [
          { id: "regular", name: "Regular" },
          {
            id: "xl",
            name: "Extra Large",
            description: "The last source wins.",
          },
        ],
      },
    ]);
    expect(theme.tokens.size).not.toHaveProperty("$description");
  });

  it("describes a theme alone, without the documents it came from", async () => {
    const { parsed } = await load("resolver.json");
    const { theme, manifest } = assemble(parsed, {});
    expect(describe(theme)).toEqual(manifest);
  });

  it("is empty for a theme without modifiers", async () => {
    const { parsed } = await load("base.json");
    expect(assemble(parsed, { name: "Base" }).manifest).toEqual([]);
  });
});
