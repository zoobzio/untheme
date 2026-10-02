import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { build } from "../src/build";
import { defineConfig } from "../src/config";
import {
  InvalidConfigError,
  MalformedConfigError,
  MissingConfigError,
} from "../src/error";
import { loadConfig } from "../src/load";
import { writeOutput } from "../src/write";
import { FIXTURES } from "./helpers";

/** The fixture resolver, as an absolute path a temp project can point at. */
const RESOLVER = fileURLToPath(new URL("resolver.json", FIXTURES));

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "untheme-kit-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const config = async (body: string, name = "untheme.config.ts") => {
  await writeFile(join(root, name), body);
};

describe("defineConfig", () => {
  it("returns the config it is given", () => {
    const authored = { source: "./tokens.resolver.json" };
    expect(defineConfig(authored)).toBe(authored);
  });
});

describe("loadConfig", () => {
  it("loads the default export of a TypeScript config", async () => {
    await config(
      `const source: string = ${JSON.stringify(RESOLVER)};\nexport default { source, name: "Loaded" };\n`,
    );
    await expect(loadConfig(join(root, "untheme.config.ts"))).resolves.toEqual({
      source: RESOLVER,
      name: "Loaded",
    });
  });

  it("throws when there is no file", async () => {
    await expect(loadConfig(join(root, "untheme.config.ts"))).rejects.toThrow(
      MissingConfigError,
    );
  });

  it("throws when the default export is not a config", async () => {
    await config("export default { tokens: {} };\n");
    await expect(loadConfig(join(root, "untheme.config.ts"))).rejects.toThrow(
      MalformedConfigError,
    );
  });
});

describe("build", () => {
  it("writes the modules and a manifest under the output directory", async () => {
    await config(`export default { source: ${JSON.stringify(RESOLVER)} };\n`);
    const output = await build({ root });
    expect(output.outDir).toBe("untheme");
    const written = (await readdir(join(root, "untheme"))).sort();
    expect(written).toEqual([
      ".untheme.json",
      "config.d.mts",
      "config.mjs",
      "index.d.mts",
      "index.mjs",
    ]);
    const manifest = JSON.parse(
      await readFile(join(root, "untheme", ".untheme.json"), "utf8"),
    );
    expect(manifest.files).toEqual(output.files.map((file) => file.path));
  });

  it("builds the config it is pointed at, with relative sources", async () => {
    await writeFile(
      join(root, "tokens.json"),
      JSON.stringify({ gap: { $type: "number", $value: 4 } }),
    );
    await config(
      'export default { source: "./tokens.json", name: "Gap", outDir: "src/theme" };\n',
      "theme.config.ts",
    );
    await build({ root, config: "theme.config.ts" });
    const theme = await readFile(join(root, "src/theme/config.mjs"), "utf8");
    expect(theme).toContain('"id": "gap"');
  });

  it("rejects an invalid config", async () => {
    await config(
      `export default { source: ${JSON.stringify(RESOLVER)}, outDir: "/abs" };\n`,
    );
    await expect(build({ root })).rejects.toThrow(InvalidConfigError);
  });
});

describe("writeOutput", () => {
  it("removes files the previous write produced and this one does not", async () => {
    await writeOutput(
      {
        outDir: "out",
        files: [
          { path: "a.mjs", contents: "a" },
          { path: "b.mjs", contents: "b" },
        ],
      },
      root,
    );
    await writeFile(join(root, "out", "authored.ts"), "mine");
    await writeOutput(
      { outDir: "out", files: [{ path: "a.mjs", contents: "a2" }] },
      root,
    );
    const written = (await readdir(join(root, "out"))).sort();
    expect(written).toEqual([".untheme.json", "a.mjs", "authored.ts"]);
    expect(await readFile(join(root, "out", "a.mjs"), "utf8")).toBe("a2");
  });

  it("leaves alone a manifest entry that reaches outside the directory", async () => {
    await writeFile(join(root, "keep.txt"), "keep");
    await writeOutput({ outDir: "out", files: [] }, root);
    await writeFile(
      join(root, "out", ".untheme.json"),
      JSON.stringify({ files: ["../keep.txt", 7] }),
    );
    await writeOutput({ outDir: "out", files: [] }, root);
    expect(await readFile(join(root, "keep.txt"), "utf8")).toBe("keep");
  });

  it("treats an unreadable manifest as empty", async () => {
    await writeOutput({ outDir: "out", files: [] }, root);
    await writeFile(join(root, "out", ".untheme.json"), "{not json");
    await expect(
      writeOutput({ outDir: "out", files: [] }, root),
    ).resolves.toBeUndefined();
  });
});
