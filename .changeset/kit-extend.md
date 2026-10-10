---
"@untheme/kit": minor
"@untheme/aurora": minor
---

A config can extend its source, and a build is a preset.

**Extend.** `extend` is a fragment of the source document, merged onto it
before the parse. Objects merge key by key. Arrays concatenate, the items of
the document first. Any other value replaces the one of the document. A
relative `$ref` in the fragment resolves from the project root. The merged
document is plain DTCG, and the proof covers it. The fragment names the node
that it changes, and the node sets the precedence: a file added to a set
rebinds the sources before it and loses to every modifier context. A consumer
of a preset writes token files and no resolver of its own.

**Presets.** A source that names a package with no path, such as
`npm:/@untheme/aurora`, is a preset. The kit reads the `preset.json` of the
package, takes its resolver document as the source, and inherits its layers,
each checked against the new contract. Every build in a named package writes
`resolver.json`, the document it parsed with every reference to a file of the
project rewritten as an `npm:/` reference into the package, and
`preset.json`, which names it and lists the layers. A package that exports
both is a source for the next build.

**The base is a layer.** The first layer of every build has the id and the
name of the theme. Its tokens are what the config changed about the base of
its source, or none. A configured layer with the id of the base takes its
place. Aurora exports `./preset.json` and `./resolver.json`.
