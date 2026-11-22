---
"@javaabu/forms": patch
---

A radio's or checkbox's `default` (or bound model value) no longer overrides data that `useForm()` already holds. The store wins, as it does for value fields.
