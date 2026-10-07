---
"@untheme/kit": patch
---

Builds run about a third faster. Terrazzo is parsed with `alphabetize` off —
its sort built a collator per comparison and re-sorted every group index on
every context resolution, the single largest cost of a build — and the kit
orders each token set once with the same natural, numeric-aware collation.
The emitted modules are byte for byte what they were.
