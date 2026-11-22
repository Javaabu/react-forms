---
"@javaabu/forms": patch
---

A cascade child linked with `parent=` no longer loses its saved value on mount: it waits for the parent's value, and clears only when that value changes.
