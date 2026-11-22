---
"@javaabu/forms": patch
---

`File`, `Image`, `Hidden` and `MapInput` now write to `useForm()` data, so `<Form form={useForm(…)}>` uploads picked files and submits hidden fields (a multi-select's `sync_<name>`, `MapInput`'s coordinates and boundary). Controlled fields write their `value` too, and a reset clears a picked file.
