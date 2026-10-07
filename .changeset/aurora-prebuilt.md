---
"@untheme/aurora": patch
"@untheme/kit": patch
---

Aurora has a kit build of itself beside its DTCG JSON. The package exports the
modules that `untheme build` writes from `src/resolver.json`. `@untheme/aurora`
has the `Token`, `Modifier`, `Mod`, and `Context` types and the guards.
`@untheme/aurora/config` has the base theme, the boot selection, and the
`Contract` type. `@untheme/aurora/manifest` has the name and the description of
each modifier and each context. An app imports the config and boots
`makeUntheme` with no kit of its own. The build has the whole preset and all
thirty-one themes. The `./src/*` exports are the same as before, so a kit
config that points at the resolver, keeps some themes, or lists the files in a
resolver of its own builds as before. `untheme` is an optional peer dependency,
for the types of the modules.

Aurora has its own test suite. The suite of the kit no longer builds aurora,
and the kit no longer depends on it. The loader tests of the kit resolve
`npm:/` references through a fixture package.
