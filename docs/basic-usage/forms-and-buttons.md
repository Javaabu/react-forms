---
title: Forms, buttons and labels
sidebar_position: 1.1
---

```blade
<x-forms::form method="PATCH" :action="route('articles.update', $article)" :model="$article" files>
    <x-forms::text name="title" />
    <x-forms::submit>Save</x-forms::submit>
</x-forms::form>
```

```tsx
import { Form, Submit, Text } from "@javaabu/forms"
import { update } from "@/actions/App/Http/Controllers/ArticlesController"

export function EditArticle({ article }) {
  return (
    <Form model={article} action={update} files>
      <Text name="title" />
      <Submit>ސޭވްކުރޭ</Submit>
    </Form>
  )
}
```

# Form

`Form` follows Laravel's conventions:

- `PUT`, `PATCH` and `DELETE` are sent as `POST` with a hidden `_method` field.
- Non-GET forms get a `_token` field, from `FormsProvider csrfToken` or the `<meta name="csrf-token">` tag. `csrf={false}` leaves it out.
- `files` sets `enctype="multipart/form-data"`.
- `model` binds the fields inside, and `old` gives them old input ([Model binding](./model-binding)).
- `action` takes a URL or a Laravel Wayfinder route: `store()`, `update.form(user)`, or the function itself, called with `model` ([Wayfinder](../advanced-usage/wayfinder)). The route's method is used unless you pass `method`.

## Submitting

In this order:

| You pass | The form |
| --- | --- |
| `onSubmit` | Calls it with the values (with `form`, its data). Return a promise to show the processing state; throw a 422 to show its errors. |
| `form={useForm(…)}` | Binds the fields to Inertia's `useForm()` data and submits with `form.submit()` ([Inertia](../advanced-usage/inertia)). |
| `FormsProvider router` | Submits through the router: `inertia` from `@javaabu/forms/inertia`, or `fetchRouter` for JSON endpoints. |
| nothing | Submits natively, like a Blade form. |

```tsx
<Form
  action="/subscribers"
  onSubmit={async (_values, event) => {
    const response = await fetch("/subscribers", {
      method: "POST",
      body: new FormData(event.currentTarget),
      headers: { Accept: "application/json" },
    })
    if (!response.ok) throw response // a 422 shows its errors under the fields
  }}
  onSuccess={() => alert("ސަބްސްކްރައިބް ކުރެވިއްޖެ")}
>
  <Text name="email" type="email" />
  <Submit />
</Form>
```

While a client-side submit runs (`form`, `onSubmit` or a router), the form is `aria-busy`, its fields are disabled (`disableWhileProcessing={false}` keeps them enabled) and `Submit` shows a spinner. A second submit is ignored. Errors show under their fields; see [Validation errors](./errors).

## Form props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `action` | `string \| RouteDefinition \| RouteFormDefinition \| route function` | | Where the form submits. |
| `method` | `string` | the route's, else `POST` | HTTP method; spoofed for `PUT`, `PATCH`, `DELETE`. |
| `model` | `object` | | Binds the fields inside. Also passed to an `action` route function. |
| `files` | `boolean` | `false` | `multipart/form-data`. |
| `old` | `object \| null` | `FormsProvider old` | Old input for the fields inside. |
| `csrf` | `boolean` | `true` | Add `_token` to non-GET forms. |
| `errors` | `FormErrors` | | Errors to show. Wins over page errors. |
| `errorBag` | `string` | | The error bag to read (and to send with Inertia visits). |
| `summary` | `boolean` | `false` | Show the error summary at the top. A general message (a failed submit) shows there either way. |
| `summaryTitle` | `ReactNode` | "Please correct the errors below." | |
| `focusOnError` | `boolean` | `true` | Focus the first invalid field when errors arrive. |
| `disabled` | `boolean` | `false` | Disable every field. |
| `disableWhileProcessing` | `boolean` | `true` | Disable the fields while submitting. |
| `processing` | `boolean` | | Mark the form as processing yourself. |
| `form` | Inertia `useForm()` result | | See [Inertia](../advanced-usage/inertia). |
| `onSubmit` | `(values, event) => unknown` | | Submit with your own code. |
| `onSuccess`, `onError`, `onProgress` | | | After a successful submit; after a failed one; upload progress (0–100). |
| `visitOptions`, `preserveScroll`, `preserveState`, `resetOnSuccess` | | | Router options ([Inertia](../advanced-usage/inertia)). |
| `components` | `Partial<FormsComponents>` | | Replace adapter components for this form ([UI adapters](../advanced-usage/adapters)). |

Other `<form>` attributes (`id`, `className`, `noValidate`, …) are passed to the form. `useFormStatus()` gives a component inside the form `processing`, `status`, `progress` and `errors`.

# Buttons

```tsx
import { Button, ButtonGroup, LinkButton, Submit } from "@javaabu/forms"

<ButtonGroup>
  <Submit>ސޭވްކުރޭ</Submit>
  <Button color="light" onClick={() => history.back()}>ކެންސަލް</Button>
  <LinkButton url="/articles/create" color="outline-primary" startIcon="plus">
    Create New
  </LinkButton>
</ButtonGroup>
```

| Component | Blade | Props |
| --- | --- | --- |
| `Button` | `button` | `color` (default `primary`), `size` (`sm`, `md`, `lg`, `icon`), `type` (default `button`), `loading`, `startIcon`, `endIcon`, `animate`, and `<button>` attributes. |
| `Submit` | `submit` | `Button` with `type="submit"` and `animate`: a spinner on a valid submit and while the form processes (js-utilities' `animate-submit`). |
| `LinkButton` | `link-button` | `url`, `color`, `size`, `disabled`, `startIcon`, `endIcon`, and `<a>` attributes. |
| `ButtonGroup` | `button-group` | `inline` (default `true`; `false` stacks the buttons). |

`color` takes Blade's Bootstrap colours: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `link` and `outline-*`. Each adapter maps them to its own variants (Onu: `danger` is `destructive`, `light` is `outline`, …). `startIcon` and `endIcon` take Blade's icon names (`pencil`, `trash-2`, `eye`, `check`, `plus`, …) or icon font classes; see [Icons](./icons).

# Labels, help and errors

| Component | Blade | Use |
| --- | --- | --- |
| `FormGroup` | `form-group` | Label, help and errors around any control: `<FormGroup name="color" label="ކުލަ"><MyColorPicker /></FormGroup>`. `blankLabel` keeps an empty label column; `wrap={false}` renders only the children. |
| `Label` | `label` | A label with the required marker: `<Label htmlFor="title" label="Title" required />`. |
| `LabelRequired` | `label-required` | The marker on its own (`text` defaults to `*`). |
| `InputHelp` | `input-help` | Help text. |
| `Errors` | `errors` | A field's errors anywhere in the form: `<Errors name="terms" />`. `firstOnly` (default `true`), and `bag` to read a named error bag. |
| `ErrorSummary` | `error-summary` | Every error, with links to the fields. See [Validation errors](./errors). |

# Accessibility

While loading, `Submit` is disabled and marked busy (`aria-busy` in the HTML and shadcn adapters). Labels are tied to their controls, and errors are linked with `aria-describedby`. When errors arrive, the first invalid field takes focus.
