---
title: Forms, buttons and errors
sidebar_position: 1.1
---

```tsx
<Forms.Form method="PATCH" action={`/articles/${article.id}`} model={article} files>
  …
  <Forms.Submit>Save</Forms.Submit>
</Forms.Form>
```

`Form` is Onu's `Form`, with Laravel's conventions added:

- `PUT`, `PATCH` and `DELETE` are sent as `POST` with a `_method` field.
- Non-GET forms get a `_token` field.
- `files` sets `enctype="multipart/form-data"`.
- `model` binds the fields inside, and `old` gives them old input.

Without `onSubmit`, the form submits natively, like a Blade form. With `onSubmit`, return the request promise (axios, fetch or Inertia). A rejected 422 shows its errors under the fields, with an error summary at the top. With Inertia, pass `errors={form.errors}` and `processing={form.processing}`. All of Onu `Form`'s props (`labelLayout`, `summary`, `onSuccess`, …) work.

## Buttons

| Component | Props |
| --- | --- |
| `Button` | `color` (`primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `link`, `outline-*`), `type`, `animate`, Onu `Button` props |
| `Submit` | `color`. Shows a spinner on a valid submit (js-utilities' `animate-submit`) or while `onSubmit` runs |
| `LinkButton` | `url`, `color` |
| `ButtonGroup` | `inline` (default `true`; `false` stacks vertically) |

## Labels and errors

`FormGroup` wraps any control with a label, help and errors. `Label`, `LabelRequired`, `InputHelp` and `Errors name="title"` are the building blocks on their own.
