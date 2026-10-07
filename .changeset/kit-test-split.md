---
"@untheme/kit": patch
---

The kit test suite runs about a third faster. The narrowed aurora builds have
their own test file, so they no longer wait on the full 31-theme build in the
same worker, and they compare against a two-theme reference instead of the
full build. Vitest reuses workers across files. No source or emitted output
changes.
