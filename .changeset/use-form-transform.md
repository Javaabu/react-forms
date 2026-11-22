---
"@javaabu/forms": patch
---

`<Form form={useForm(…)}>` no longer replaces your `form.transform()` on every submit. It sets a transform only to add `_method` to a multipart `PUT` / `PATCH` / `DELETE`.
