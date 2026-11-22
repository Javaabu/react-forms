---
"@javaabu/forms": patch
---

Fields named like `items[0][name]` create arrays in `useForm()` data (`{ items: [{ name }] }`) instead of objects keyed `"0"`.
