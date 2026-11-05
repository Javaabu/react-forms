---
title: Inertia
sidebar_position: 2
---

Forms work with [Inertia](https://inertiajs.com) in two ways, with no glue code: through the **Inertia router**, which submits every form as an Inertia visit, or with **`useForm()`**, where the fields bind to the form's data. `@inertiajs/react` v2 or v3 is an optional peer dependency; only `@javaabu/forms/inertia` imports it.

# The Inertia router

Set it once, in your layout or `createInertiaApp`'s `setup`:

```tsx
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { inertia, inertiaLinks } from "@javaabu/forms/inertia"
import { onu } from "@javaabu/forms/onu"

const ui = mergeAdapters(onu, inertiaLinks)

export default function Layout({ children }) {
  return (
    <FormsProvider ui={ui} router={inertia}>
      {children}
    </FormsProvider>
  )
}
```

Then forms are plain Blade-style forms:

```tsx
import { Form, Text, Email, Submit } from "@javaabu/forms"
import { update } from "@/actions/App/Http/Controllers/UsersController"

export default function Edit({ user }) {
  return (
    <Form model={user} action={update} preserveScroll>
      <Text name="name" required />
      <Email name="email" required />
      <Submit>ސޭވްކުރޭ</Submit>
    </Form>
  )
}
```

What happens:

- **Submitting** sends the form's `FormData` with `router.visit`, so files upload and `PUT` / `PATCH` / `DELETE` are spoofed with `_method`, as Laravel expects for multipart bodies. `GET` forms visit the URL with the fields in the query string.
- **Errors** come from the page's `errors` prop and appear under their fields. `errorBag="createUser"` picks a named bag and is sent with the visit.
- **State**: `preserveState` defaults to `"errors"`, so a failed submit keeps what the user typed. A successful one shows the new props: fields follow the updated model.
- **Processing** disables the fields and shows the submit button's spinner. `onProgress` gets the upload percentage, and `useFormStatus().progress` has it too.
- **Old input**: Inertia keeps the page state, so you rarely need it. If you share `old` (`'old' => fn () => $request->session()->getOldInput()`), forms use it.

Every other visit option goes through `visitOptions`: `<Form visitOptions={{ only: ["users"], replace: true }}>`. `preserveScroll` and `preserveState` also have their own props, and `resetOnSuccess` (all fields, or a list of names) returns the fields to their starting values after a successful submit. `onSuccess(page)` and `onError(errors)` run after the visit.

`inertiaLinks` puts Inertia's `<Link>` in the `Link` slot, so links inside components (tabs, pagination, link buttons) navigate without a full reload. External URLs, `target="_blank"` and downloads stay plain anchors. With the Onu adapter, also set `OnuProvider linkComponent` for Onu's own links.

# `useForm()`

Pass the result of `useForm()` to `form`. The fields read and write `form.data`; nested names (`address[city]`) map to nested data. The form shows `form.errors`, `form.processing` and `form.progress`, and submits with `form.submit()`:

```tsx
import { useForm } from "@inertiajs/react"
import { Form, Text, Checkbox, File, Submit } from "@javaabu/forms"
import { store } from "@/actions/App/Http/Controllers/PostsController"

export default function Create() {
  const form = useForm({ title: "", channels: [], cover: null })

  return (
    <Form form={form} action={store()} files resetOnSuccess>
      <Text name="title" thaana />
      <Checkbox name="channels[]" value="email" label="Email" />
      <Checkbox name="channels[]" value="sms" label="SMS" />
      <File name="cover" />
      <Submit />
      {form.progress ? <progress value={form.progress.percentage} max={100} /> : null}
    </Form>
  )
}
```

- A field that isn't in `form.data` yet starts from the model, old input or `default`, and is added to the data.
- Checkbox groups (`channels[]`) hold an array of the checked values, a single checkbox its value or `false`, and radios the selected value.
- Editing a field clears its error with `form.clearErrors()`.
- With `files`, a `PUT` / `PATCH` / `DELETE` is sent as `POST` with `_method` (through `form.transform()`).

Use `useForm()` when the page needs the data in code (live previews, computed fields). Otherwise the router is simpler.

# Without Inertia

Without a router, a form submits natively, like a Blade form. For JSON endpoints, use `fetchRouter` from `@javaabu/forms`: it posts the `FormData` with the CSRF token, shows a 422's errors and passes the response to `onSuccess`:

```tsx
import { FormsProvider, fetchRouter } from "@javaabu/forms"

<FormsProvider router={fetchRouter}>
  <Form action="/api/subscribers" onSuccess={(body) => toast(body.message)}>…</Form>
</FormsProvider>
```

Or handle it yourself with `onSubmit`. See [Validation errors](../basic-usage/errors).

# Writing a router

A router is `{ name, submit(request, callbacks), usePageErrors?, useOldInput? }` (`FormsRouter`). `submit` gets the URL, the real method, the `FormData`, the form element, the error bag and the visit options, and calls `onStart`, `onProgress`, `onSuccess`, `onError(errors)`, `onFailure(error)` and `onFinish`. The two optional hooks return the current page's errors (every bag) and old input.
