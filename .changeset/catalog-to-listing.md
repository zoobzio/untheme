---
"@untheme/catalog": minor
---

`toListing(query)` is exported: it fills a query's gaps with the default
ordering and window, the normalization `defineCatalog` applies. A serving
handler uses it in place of its own copy.
