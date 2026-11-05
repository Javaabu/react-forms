---
"@javaabu/forms": minor
---

Validation errors are now handled by the core, for every adapter. Errors come from Inertia page props, `useForm()`, a JSON 422 response, the `errors` prop or `FormsProvider errors`. Fields match them in dot or bracket notation, and array fields (`tags[]`) also collect their items' errors (`tags.0`). Error bags work with `errorBag`. New: `ErrorSummary`, `ValidationError`, `errorsFor`, `selectErrorBag` and `useFormState()`. Invalid fields get `aria-invalid` and `aria-describedby`, and the first one is focused when errors arrive.
