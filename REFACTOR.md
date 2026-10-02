# Refactor brief: DTCG JSON as the only definition format

This document is a work brief for an agent. It describes a refactor of the
untheme monorepo. Read all of it before you change code.

## How to read this document

Everything in this document is decided. Do not redesign it. If something is
unclear or does not work, ask the owner.

- **Decided** marks a decision the owner made in person.
- **Fact** marks something that was tested or read in the code. The date of
  the tests is 2026-10-02, at commit `6c8a59d`.
- Details with no label follow `@icon-sheets/kit` and `@icon-sheets/nuxt`,
  which the owner named as the pattern.

## 1. The problem

Today untheme has two ways to define tokens:

1. **TypeScript.** Themes are written as TS literals. Presets are built with
   `defineUnthemePreset` and composed with `configure`, `define`, `use` and
   `extend`. This composition runs when the module is imported.
2. **DTCG JSON.** The `@untheme/terrazzo` integration reads standard DTCG
   JSON (token files and a resolver file) and generates an equivalent TS
   config.

Both describe the same token model. The aurora preset exists twice: as TS in
`presets/aurora`, and as JSON in `examples/terrazzo/tokens`.

## 2. The goal

- **Decided:** DTCG JSON is the only definition format. The TS definition
  path is removed.
- **Decided:** `@untheme/kit` becomes a generator. One authored
  `untheme.config.ts` points at DTCG JSON. A build step turns it into the
  files the runtime service consumes.
- **Decided:** the model for this is `@icon-sheets/kit`. Read it first:
  `~/code/icon-sheets/packages/kit` and the commits `40cd6b0`, `44bfc0b` and
  `5769532` in that repository.

The target pipeline:

```
untheme.config.ts          (authored: points at JSON)
        |
        v
@untheme/kit               (build time: uses @terrazzo/parser)
        |
        v
contract + keys            (generated modules and declarations)
        |
        v
runtime service            (core, css, catalog: no Terrazzo)
```

## 3. Decisions

1. **Decided:** remove `defineUntheme` and the TS authoring path. `makeUntheme`
   stays as the constructor of the runtime service.
2. **Decided:** remove the current content of `@untheme/kit`
   (`defineUnthemePreset`, `makePreset`, `configure`, `define`, `use` and
   their types). Replace it with the generator.
3. **Decided:** move the code of `integrations/terrazzo` into the kit. Delete
   the `@untheme/terrazzo` package. The kit depends on `@terrazzo/parser`
   directly.
4. **Decided:** do not use `tz build`, `@terrazzo/cli`, `@terrazzo/plugin-css`
   or `@terrazzo/plugin-js`. Only the parser is used. The kit has its own CLI.
5. **Decided:** `@untheme/css` stays the only CSS writer. The runtime service
   keeps rendering CSS from the active theme, as it does today.
6. **Decided:** the runtime packages (`core`, `css`, `catalog`, `schema`,
   `utils`) must not import Terrazzo.
7. **Decided:** aurora ships only DTCG JSON. It has no `@untheme/*`
   dependencies. Its base tokens are split into many small files, grouped by
   use.
8. **Decided:** aurora has no tests of its own. Aurora becomes the test
   fixture of the kit. Keep the channel checks (see section 6.2) in the kit's
   tests.
9. **Decided:** a `$ref` that starts with `npm:/` is loaded from an installed
   package. Example: `npm:/@untheme/aurora/aurora.resolver.json`.
10. **Decided:** composition and layering use the DTCG resolver format as it
    is. There is no untheme API for overrides or extensions. A user who wants
    aurora plus additions writes their own resolver file.
11. **Decided:** fix the modifier bug described in section 7.1 as part of the
    move.
12. **Decided:** the Nuxt module drops its per-member merge of configs across
    Nuxt layers. It uses replace semantics.
13. **Decided:** themes are not part of the config or the kit. The kit builds
    the base theme only. It reads no theme files and emits no theme layers.
14. **Decided:** the kit emits no CSS. The runtime writes the CSS.
15. **Decided:** the Nuxt module gets its theme in one of two ways, the same
    pattern as `@icon-sheets/nuxt`: it finds the config file and builds it
    through the kit, or it receives a built contract directly.
16. **Decided:** the `untheme` umbrella does not export the kit.
17. **Decided:** the themes API stays, but the Nuxt module does not register
    it. A helper named `createThemeHandler` creates the endpoint. The user
    puts it in a server route file of their choice.
18. **Decided:** aurora keeps all 31 theme variants, as JSON. A helper named
    `createAuroraThemeHandler` serves them through the same endpoint, so an
    app that uses aurora can switch between all of its themes.
19. **Decided:** both handler helpers live in `@untheme/nuxt`. The aurora
    package stays JSON only.
20. **Decided:** the Nuxt module keeps its static stylesheet
    (`#build/untheme.css` and the `css` option), so that a user can import
    the variables through CSS. "No CSS output" applies to the kit only.
21. **Decided:** each aurora theme is a folder that mirrors the shape of the
    base token folder. A theme holds only the files it rebinds.
22. **Decided:** the config field that points at the resolver file is named
    `source`.
23. **Decided:** the `id` and `name` of the base theme come from the resolver
    file. Optional `id` and `name` fields in the config replace them.
24. **Decided:** the aurora layout is one JSON file per thing: one file per
    color, one file per role group, one file per modifier.
25. **Decided:** `createThemeHandler` is exported from `@untheme/nuxt/server`
    and `createAuroraThemeHandler` from `@untheme/nuxt/aurora`.
    `@untheme/aurora` is an optional peer dependency of `@untheme/nuxt`.

## 4. Work by area

### 4.1 `packages/kit`

- Delete `src/factory.ts`, `src/preset.ts`, `src/types.ts` and their tests.
- Build the generator with the same parts as `@icon-sheets/kit`:
  config helper, load, validate, resolve, emit, write, CLI.
- The CLI command is `untheme build [--config <file>] [--root <dir>]`.
- Move in the code from `integrations/terrazzo/src`: `contexts.ts`,
  `convert.ts`, `source.ts`, `verify.ts`, `util.ts`, and the `assemble` and
  `reframe` functions of `generate.ts`. Move the tests too.
- Do not move `plugin.ts` or `themes.ts`. Delete them, with their tests and
  the fixtures that only they use. Remove the theme handling from the code
  you move (`ThemeSource`, the `themes` option, `identify`, the `flat` member
  of `Core`).
- Replace `emit.ts`. Today it writes one TS file that depends on type
  inference from a large literal. The new emit writes data modules with
  declaration files that contain explicit unions (see section 5.2). It writes
  no theme layers and no CSS.
- Add the `npm:/` loader (see section 7.3).
- Import the internal packages (`@untheme/schema`, `@untheme/utils`,
  `@untheme/core`), not the `untheme` umbrella. This avoids a dependency
  cycle. The proof step needs `makeUntheme` from core.

### 4.2 `integrations/terrazzo`

- Delete the package after its code is in the kit.
- Remove `@untheme/terrazzo` from the `fixed` group in
  `.changeset/config.json`.
- Do not deprecate the published package on npm. The owner does that.

### 4.3 `presets/aurora`

- Change `scripts/generate.mjs` to write JSON instead of TS. The seeds stay
  in `scripts/seeds.json`.
- Use `examples/terrazzo/tokens` as the starting point. It is a faithful JSON
  port of the base preset (see section 7.4).
- Split the base token file and the modifier files as in section 5.3.
- Generate all 31 theme variants as JSON, with a manifest (see section 5.4).
  **Fact:** today they are generated TS files in `src/themes`, and only
  `abyss`, `gruvbox` and `nord` exist as JSON.
- Delete `src/`, `test/`, `build.config.ts`, `tsconfig.json` and
  `vitest.config.ts`. Remove all `@untheme/*` dependencies.
- Export the JSON files in `package.json`, so that Node package resolution
  can find them.
- Rewrite the README.

### 4.4 `packages/utils`

- Delete `extend.ts`, the `Extension` type, and their tests. **Fact:** only
  the current kit uses them.
- Keep `clone`, `copy`, `merge`, `diff`, `delta`, `traverse` and `isTemplate`.

### 4.5 `packages/core`

- Delete `service.ts` (`defineUntheme`) and its tests. Update comments in
  `factory.ts` and `error.ts` that mention it.

### 4.6 `packages/schema`

- The runtime validator stays. The runtime still validates layers, patches
  and `set` calls.
- `Contract<Tok, Mod>` stays. Generated declarations use it.
- Types that served only TS authoring can go. Check every use before you
  delete a type. `Authored` is one candidate; it is also used in
  `Domain["definition"]` and `Assert["definition"]`.

### 4.7 `packages/untheme` (the umbrella)

- Remove the `./kit` subpath export and the dependency on `@untheme/kit`.
- `./config`: keep the `UnthemeConfig` type and `useUnthemeConfig`. They
  describe the resolved shape (`theme` and `input`) that the kit emits.
- Update `test/exports.test.ts`.

### 4.8 `integrations/nuxt`

- Two ways to get the theme. See
  `~/code/icon-sheets/integrations/nuxt/src/icons.ts` for the pattern.
  - With no contract in the options, the module finds `untheme.config.ts` in
    the project root and builds it through the kit, in memory. A `config`
    option names another path.
  - With a contract in the options (`theme` and `input`, the output of a kit
    build done elsewhere), the module uses it as passed.
- `setup` becomes async.
- Add the config file and the JSON source files to Nuxt's watch list.
- Remove the `themes` option.
- Delete `src/resolve.ts` and its tests. When more than one Nuxt layer sets
  `untheme`, the closest layer's value is used whole. See the trap in
  section 7.6.
- Remove the auto-registered catalog: the two `addServerHandler` calls, the
  server assets and the `build:before` write, `runtime/server/list.ts` and
  `runtime/server/get.ts`, and the constants `MOUNT`, `ASSETS`, `ENTRIES` and
  `THEMES`.
- Add the two handler helpers (see section 5.4).
- Keep the static stylesheet and the `css` option. The module renders the
  sheet with `@untheme/css` from the theme it got, as it does today.
- `runtime/client.ts` calls `defineUntheme<Token, Mod>`. Change it to
  `makeUntheme<Contract<Token, Mod>>` from core.
- This is a breaking change to the module options.

### 4.9 Examples

- `examples/nuxt`: `untheme.config.ts` becomes a small file that points at
  aurora. Remove the 31 theme imports. Update the Vite aliases in
  `nuxt.config.ts`. The theme picker stays. Add one server route file that
  uses `createAuroraThemeHandler`, and point the catalog client in
  `composables/catalog.ts` at that route's base.
- `examples/shiki` and `examples/codemirror`: `src/preset.ts` uses
  `preset.configure` to add `syntax-*` tokens. Replace it with a JSON token
  file, a resolver file, an `untheme.config.ts`, and a build step that runs
  before `typecheck` and before the app starts.
- `examples/terrazzo`: delete it. Aurora replaces it.

### 4.10 Docs and tooling

- Rewrite every README that shows TS authoring: the root README,
  `packages/README.md`, `integrations/README.md`, `examples/README.md`, and
  the READMEs of core, kit, utils, css, untheme, aurora, nuxt, shiki and
  codemirror.
- Check `Makefile`, `.github/workflows/ci.yml`, the root `vitest.config.ts`
  and `codecov.yml`. Aurora will have no build and no tests.
- Add changesets for the breaking changes. One unreleased changeset exists:
  `.changeset/nuxt-static-cascade-stylesheet.md`. Do not delete it.

## 5. Design

### 5.1 The authored config

```ts
// untheme.config.ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({
  // Required. The resolver file: a path, a URL, or an npm:/ reference.
  source: "npm:/@untheme/aurora/aurora.resolver.json",

  // Optional. They replace the identity from the resolver file.
  id: "app",
  name: "App",

  // Optional. Output directory, relative to the project root.
  // Default: "untheme".
  outDir: "untheme",
});
```

- Identity: the `name` in the resolver file is the default name, and its
  slug is the default id. The current Terrazzo code already works this way.
- The boot selection (`input`) is not authored. It comes from the `default`
  context of each modifier in the resolver file. The current Terrazzo code
  already works this way.
- `untheme/config` keeps `defineUnthemeConfig` for the built shape (`theme`
  and `input`), as `icon-sheets/config` keeps `defineIconSheetsConfig`.
  `@untheme/nuxt/config` keeps its helper, typed for the new module options.

### 5.2 The emitted files

Each module is an `.mjs` file with a `.d.mts` file beside it.

| File            | Contents                                                          |
| --------------- | ----------------------------------------------------------------- |
| `index.mjs`     | `Token` union, modifier and context types, token list, guards     |
| `config.mjs`    | `theme` and `input`; the default export is for `useUnthemeConfig` |
| a manifest file | the list of written files, for safe cleanup on the next build     |

**Decided:** no theme layers and no CSS file. The manifest file is named
`.untheme.json`.

The root entry carries no token data. The Nuxt module already writes a
`Token` union and a `Mod` type from the schema; see `addTypeTemplate` in
`integrations/nuxt/src/module.ts`.

The kit also needs an in-memory function like `resolveKit` in icon-sheets,
which returns the resolved documents without writing files. The Nuxt module
uses it.

### 5.3 The aurora file layout

One JSON file per thing. Token names do not change (`primary-50` stays
`primary-50`), so the CSS variable names stay the same.

```
presets/aurora/
  aurora.resolver.json
  tokens/
    colors/                    one file per color: its ramp
      primary.json  secondary.json  tertiary.json     33 tokens each
      error.json    success.json    warning.json      33 tokens each
      neutral.json  neutral-variant.json              11 tokens each
    roles/                     one file per color: its semantic tokens
      primary.json  secondary.json  tertiary.json     16 tokens each
      error.json    success.json    warning.json      16 tokens each
      surface.json                                    14 tokens
    typography.json  20
    shape.json  4     space.json  10    elevation.json  4
    motion.json 11    state.json   3    blur.json       3
    stroke.json 2     border.json  3    gradient.json   2
  modifiers/                   one file per modifier
    color.json  vibrancy.json  contrast.json  text.json
    density.json  radius.json  depth.json  motion.json
  themes/
    index.json                 the manifest: id, name, description
    <id>/colors/               the same eight files as tokens/colors
  scripts/generate.mjs
  scripts/seeds.json
```

What the files hold:

- **A color file** holds one ramp. An accent ramp has three columns of
  eleven stops: base, muted and vivid. A neutral ramp has one column.
- **A role file** holds every semantic token of one color. For an accent
  color that is 4 roles (`primary`, `on-primary`, `primary-container`,
  `on-primary-container`), their 4 contrast tokens (`*-medium-contrast`,
  `*-high-contrast`) and their 8 vibrancy tokens (`*-muted`, `*-vivid`).
  `surface.json` holds the 8 surface roles and their 6 contrast tokens.
- **A modifier file** holds every context of one modifier, one top-level key
  per context. The default context is an empty object. The resolver file
  reads a context with a JSON pointer:

  ```json
  "contrast": {
    "contexts": {
      "default": [{ "$ref": "./modifiers/contrast.json#/default" }],
      "medium": [{ "$ref": "./modifiers/contrast.json#/medium" }],
      "high": [{ "$ref": "./modifiers/contrast.json#/high" }]
    },
    "default": "default"
  }
  ```

  **Fact:** this was tested with all eight modifiers. The generator's output
  is identical to the output from one file per context.

- **A theme folder** mirrors the shape of `tokens/` and holds only the files
  the theme rebinds. **Fact:** every one of the 31 themes rebinds exactly the
  220 ramp tokens and nothing else, so today every theme folder is `colors/`
  with eight files.

What each base file needs:

| File             | Needs              |
| ---------------- | ------------------ |
| a `roles` file   | the `colors` files |
| `border`         | `roles`, `stroke`  |
| `gradient`       | `colors`, `roles`  |
| every other file | nothing            |

What each modifier needs:

| Modifier                               | Needs                                   |
| -------------------------------------- | --------------------------------------- |
| `color`                                | `roles`, `gradient`                     |
| `vibrancy`, `contrast`                 | `roles`                                 |
| `text`                                 | `typography`                            |
| `density`, `radius`, `depth`, `motion` | `space`, `shape`, `elevation`, `motion` |

Put these two tables in aurora's README.

### 5.4 The theme handlers

`createThemeHandler(provider)` returns one h3 event handler. It speaks the
existing catalog wire protocol, so the existing browser client
(`defineClient` from `untheme/catalog`) works with it unchanged:

- `GET {base}/themes?q=<JSON query>` answers a page of entries.
- `GET {base}/themes/{id}` answers one layer, or 404.

The `provider` is the existing `Provider` type of `@untheme/catalog`: a
`list(listing)` callback and a `get(id)` callback. The user binds them to
wherever the themes are stored.

The user creates one route file. The folder of the file is the base:

```ts
// server/api/untheme/[...path].get.ts
import { createThemeHandler } from "@untheme/nuxt/server";

export default createThemeHandler({
  list: (listing) => /* read entries from storage */,
  get: (id) => /* read one layer from storage */,
});
```

```ts
// in the app
const catalog = defineClient(untheme.schema, { base: "/api/untheme" });
```

`createAuroraThemeHandler()` is the same handler with a built-in provider
over aurora's theme files:

```ts
// server/api/untheme/[...path].get.ts
import { createAuroraThemeHandler } from "@untheme/nuxt/aurora";

export default createAuroraThemeHandler();
```

Design points:

- **Where the helpers live.** `createThemeHandler` is in
  `@untheme/nuxt/server`. `createAuroraThemeHandler` is in
  `@untheme/nuxt/aurora`, a separate entry, so that an app without aurora
  can use the first helper. `@untheme/aurora` is an optional peer dependency
  of `@untheme/nuxt`.
- **The aurora theme files** are normal DTCG token files with flat token
  names, in a folder per theme (see section 5.3). The helper turns one theme
  into a layer: `id` and `name` from the manifest, and each token's `$value`
  from every file of the theme as its binding. This needs no Terrazzo at run
  time. Because the files are normal token files, a user can also list a
  theme's files in their own resolver as a set.
- **Loading the files.** Use a static map with one lazy `import()` per theme
  file, so that the server bundler sees every file (see section 7.8). With 31
  themes of eight files, the map has 248 entries. Generate it from aurora's
  manifest and folders, and add a test that compares it with them.
- **The list route** filters, sorts and cuts a window over the manifest. The
  logic exists today in `runtime/server/list.ts`. Keep it as a helper for
  providers that hold their entries in memory.
- **Validation.** The handler does not validate layers. The browser client
  validates every layer against the app's contract when it receives it. This
  is how it works today.

## 6. Tests

### 6.1 General

- **Fact:** the baseline is green. `pnpm test` passes 875 tests, and
  `pnpm typecheck` is clean.
- Tests of deleted code are deleted with it.
- The moved Terrazzo tests keep their fixtures.

### 6.2 Aurora as the kit's fixture

Build aurora in the kit's tests. This covers the structure checks: a valid
contract, and references that resolve.

Keep these checks from the old aurora tests, because a build cannot detect
these errors: The old tests call the contrast tokens and the vibrancy
tokens of the role files "channels".

- From `presets/aurora/test/axes.test.ts`: the groups "vibrancy channels" and
  "contrast channels" (every channel exists, every channel is rebound in the
  dark context, both levels shift the same roles), and "resolves vibrancy
  after color, and contrast after vibrancy".
- From `presets/aurora/test/service.test.ts`: the collision tests of the
  color, vibrancy and contrast axes.

The ramp checks can go. Those files are generated.

### 6.3 The theme handlers

- Move the route tests of `runtime/server/list.ts` and `runtime/server/get.ts`
  to the new handler.
- For every aurora theme, check that the layer the aurora handler answers is
  a valid layer of the contract that the kit builds from aurora, and that it
  rebinds only ramp tokens.

## 7. Facts and traps

### 7.1 The modifier bug

The resolver format allows a modifier in two places: in the top-level
`modifiers` map, or inline inside `resolutionOrder`. Terrazzo handles both.
Our code reads only the top-level map. A file that uses the inline form
builds with no error, but the modifier is missing from the output.

Three places read `resolver.source.modifiers` and need the fix:

- `contexts.ts`, function `authored`
- `source.ts`, function `identity`
- `verify.ts`, in two branches

### 7.2 Limits of the resolver format

These are not bugs. They are how Terrazzo 2.4.0 and 2.7.1 behave.

- A resolver file cannot include a modifier, or a context, from another
  resolver file by `$ref`. A user's own resolver must declare each modifier
  again and list the files of each context.
- A resolver file cannot be the source of a set in another resolver file.
- A `$ref` in `resolutionOrder` that points at a modifier in another file is
  accepted and then ignored, with no error.
- A file whose aliases point at tokens that were not loaded fails with a
  clear error that names the alias.

These things work: a user resolver that lists aurora's files as sets; an
extra file added to one of aurora's contexts; new tokens in a user file; a
JSON pointer to one token in a file. The position of a set in
`resolutionOrder` decides which value wins.

### 7.3 The `npm:/` loader

- The parser calls a `req` hook for every document. The hook receives a URL.
  When the protocol is `npm:`, load the file from the package.
- The slash after the colon is required. `npm:@scope/pkg/file.json` cannot
  be the base for relative paths; `new URL("./x.json", base)` throws. With
  `npm:/@scope/pkg/file.json`, relative paths inside the package resolve.
- The test used a simple lookup in `node_modules`. The real loader must use
  Node package resolution from the project root. The package must export its
  JSON files.

### 7.4 JSON aurora and TS aurora are equal

The current generator was run on `examples/terrazzo/tokens`, and the result
was compared with the TS preset.

- Both have 392 tokens and the same order of modifiers.
- The static CSS has the same 16 blocks and the same declarations.

Three differences have no effect on the result:

- Terrazzo sorts tokens by name, so the order inside a CSS block changes.
- An override that equals the base value is dropped.
- Terrazzo adds `alpha: 1` to colors.

### 7.5 Coverage of the proof step

The proof step compares Terrazzo's resolution with untheme's composition.
It uses `resolver.listPermutations()` when it exists. The parser disables
that function above 1000 permutations (`permutationLimit`). Aurora has 2,916.
So for aurora the proof checks the defaults and each single-context change:
17 selections. Combinations of two or more non-default contexts are not
proved. This is one reason to keep the checks in section 6.2.

A full aurora build, including the proof, takes about 1 second.

### 7.6 Nuxt merges arrays across layers

Nuxt merges layer configs with a function that concatenates arrays. Token
values contain arrays (color components, shadow lists, gradient stops). If a
theme object passes through that merge, it is corrupted. This is why
`resolve.ts` exists today. When you delete it, read each layer's own config
from `nuxt.options._layers` and take the closest one whole. Do not take a
theme object from the merged options when more than one layer sets it.

### 7.7 Other rules that stay

- Every modifier needs a `default` context.
- A context can only rebind base tokens. It cannot add tokens.
- Token names that become the same CSS custom property fail the build
  (`a.b` and `a-b`).
- Terrazzo's beta token types (`boolean`, `string`, `link`) fail the build.
- The Nuxt runtime has its own function named `makeUntheme` in
  `runtime/client.ts`. It is not the core function of the same name.

### 7.8 Route test for the theme handler

A small Nitro server (nitropack 2.13.4) was built and run with one route
file that served three aurora theme files.

- A catch-all file inside the `themes` folder
  (`server/api/untheme/themes/[...id].get.ts`) does not match
  `/api/untheme/themes`. The list request gets a 404.
- A catch-all file one level up (`server/api/untheme/[...path].get.ts`)
  matches both `/api/untheme/themes` and `/api/untheme/themes/nord`. This is
  why the folder of the file is the base.
- JSON imported from a package with a lazy `import()` per file is bundled
  into the server as one chunk per file. The server loads a chunk only when
  it is requested. The test used one file per theme (about 33 kB each); the
  layout in section 5.3 has eight smaller files per theme.
- Not tested: the same imports from inside a published package
  (`@untheme/nuxt`) and not from an app file. Test this first. Node needs
  `with { type: "json" }` on a JSON import when the code is not bundled.

A layer from an aurora theme rebinds ramp tokens. If an app's contract does
not contain all of aurora's ramps, the browser client rejects the layer.

## 8. Order of work

1. Build the generator in the kit, with the Terrazzo code moved in and the
   modifier bug fixed. Use `examples/terrazzo/tokens` as the first fixture.
2. Convert aurora to JSON and make it the kit's fixture.
3. Change the Nuxt module and add the theme handlers.
4. Change the examples.
5. Delete `defineUntheme`, `extend`, `integrations/terrazzo` and
   `examples/terrazzo`.
6. Rewrite the docs and add the changesets.

Keep the repository green after each step.

## 9. Done means

- `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint` and `pnpm inspect`
  all pass.
- No file in the repository defines tokens in TypeScript, except test
  fixtures of the runtime packages.
- `presets/aurora/package.json` has no dependencies.
- No package except the kit depends on `@terrazzo/*`.
- `examples/nuxt` runs from an `untheme.config.ts` that only points at JSON.
- The Nuxt module registers no server routes. `examples/nuxt` can switch
  between all 31 aurora themes through one route file that uses
  `createAuroraThemeHandler`.
- For aurora, the CSS that `@untheme/css` renders from the kit's output has
  the same declarations as the CSS from the TS preset at commit `6c8a59d`.

## 10. Do not

- Do not publish, release, or deprecate packages.
- Do not keep a TS authoring path "for compatibility".
- Do not add an untheme API for overrides or extensions.
- Do not add themes or CSS output to the config or the kit.
- Do not change the runtime behaviour of `core`, `css` or `catalog`.

## 11. Out of scope

The Nuxt runtime writes the active theme id to the `untheme-key` cookie but
never reads it back (a TODO in `runtime/client.ts`). Do not change this.
