---
"@untheme/core": patch
"@untheme/utils": patch
---

Speed up token reads and deep copies. `get` now probes the layers that can
bind a token — override, selected contexts in reverse order, base slot —
instead of assembling the full flat token map on every read, which also drops
the per-hop cost of dereferencing alias chains. `copy` proves its rebuild
against the source once at the root instead of at every level; the comparison
is deep, so loss at any depth is still caught. No behavioral change to
resolution precedence or copy semantics.
