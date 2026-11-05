---
title: Validation errors
sidebar_position: 10
---

Laravel's validation errors appear under their fields without any code. A field finds its errors by name, in dot or bracket notation, marks itself invalid and links the messages to the control for screen readers. With `summary`, a list at the top of the form shows every error and links to the fields.

# Where errors come from

| Source | How |
| --- | --- |
| Inertia page props | Automatic with the [Inertia router](../advanced-usage/inertia): `usePage().props.errors`, and the form's `errorBag` |
| Inertia `useForm()` | `<Form form={form}>` shows `form.errors` |
| A JSON 422 response | `onSubmit` throws (or rejects with) the response, the axios error or the body; or the `fetchRouter` gets one |
| Your own code | `<Form errors={{ email: "Taken." }}>`, `useFormState().setErrors(errors)`, or `throw new ValidationError(errors)` in `onSubmit` |
| Server-rendered pages | `<FormsProvider errors={…}>` for every form |

```tsx
import { Form, Text, Submit, ValidationError } from "@javaabu/forms"

<Form
  action="/subscribe"
  onSubmit={async (values) => {
    const response = await fetch("/subscribe", { method: "POST", body: JSON.stringify(values) })
    if (!response.ok) throw response // a 422 shows its errors
  }}
>
  <Text name="email" type="email" />
  <Submit>ސަބްސްކްރައިބް</Submit>
</Form>
```

# Names and keys

| Field name | Laravel error key |
| --- | --- |
| `email` | `email` |
| `address[city]` | `address.city` |
| `items[0][name]` | `items.0.name` |
| `tags[]` | `tags`, and each item: `tags.0`, `tags.1` |

# Error bags

Laravel's named error bags (`$request->validateWithBag('createUser', …)`) arrive as `{ createUser: { email: […] } }`. Pick a bag with `errorBag`:

```tsx
<Form errorBag="createUser" action={store()}>…</Form>
```

Without `errorBag`, a form reads the default bag. With the Inertia router, `errorBag` is also sent with the visit.

# Showing errors

- Each field shows all its messages under the control. `showErrors={false}` hides them and the invalid state.
- `<Errors name="terms" />` shows a field's first error anywhere in the form (`firstOnly={false}` for all of them), like Blade's `<x-forms::errors>`.
- `<Form summary>` shows `<ErrorSummary>` at the top (off by default, as in Blade), and `summaryTitle` changes its heading. A general message, like a failed submit, always shows at the top. Render `<ErrorSummary />` yourself inside the form to place it elsewhere, or outside a form with `errors`.
- When the user edits a field, its error goes away until the next submit.

# Accessibility

- Invalid controls get `aria-invalid="true"` and `aria-describedby` pointing at the help text and the errors, which are in a polite live region.
- When errors arrive, the first invalid field is focused (and revealed, if it is in a closed tab or accordion). `focusOnError={false}` turns that off. With only a general message, the summary takes focus.
- The summary links move focus to their fields.
