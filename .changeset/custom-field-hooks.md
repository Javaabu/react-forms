---
"@javaabu/forms": minor
---

Custom fields: `useFieldState`, `splitFieldProps` and `usePublishField` (with `FieldStateOptions`, `UseFieldOptions`, `FieldEntry` and `FieldKind`) are exported from the package root, so fields from other packages get Inertia `useForm()` data, reset, `ConditionalWrapper` and errors like the built-in ones. New docs page: Custom fields.
