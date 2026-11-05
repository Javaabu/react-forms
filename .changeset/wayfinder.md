---
"@javaabu/forms": minor
---

`Form action` accepts Laravel Wayfinder routes: route objects (`store()`), form variants (`update.form(user)`) and route functions (`update`, called with the form's `model`). The route's method is used unless `method` is set, with `_method` spoofing for `PUT`, `PATCH` and `DELETE`. Nothing extra is needed to install.
