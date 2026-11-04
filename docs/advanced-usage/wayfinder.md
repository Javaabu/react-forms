---
title: Laravel Wayfinder
sidebar_position: 3
---

[Laravel Wayfinder](https://github.com/laravel/wayfinder) generates TypeScript functions for your controllers and routes. `Form action` takes what they return, so URLs and methods come from your routes instead of strings.

There's nothing to install or configure in this package: it reads the plain `{ url, method }` objects Wayfinder makes.

# Route objects

```tsx
import { Form, Text, Submit } from "@javaabu/forms"
import { store, update } from "@/actions/App/Http/Controllers/UsersController"

<Form action={store()}>                {/* POST /users */}
  <Text name="name" />
  <Submit />
</Form>

<Form action={update(user)} model={user}> {/* PUT /users/1, sent as POST with _method=PUT */}
  <Text name="name" />
  <Submit />
</Form>
```

The route's method is used unless you pass `method`. `PUT`, `PATCH` and `DELETE` are sent as `POST` with a hidden `_method` field, and non-GET forms get `_token`, as in Blade. `GET` routes submit as `GET`, with neither field.

# Route functions and the bound model

Pass the function itself and the form calls it with its `model`:

```tsx
<Form model={user} action={update}>   {/* update(user) → /users/1 */}
```

Wayfinder accepts a model object for a route parameter (it reads `id`, or the key you bound), so this works for routes with one parameter. For routes with several parameters, call the function yourself: `action={update({ team: team.id, user: user.id })}`.

# The `.form()` variant

Wayfinder's form variant (`--with-form`) puts the spoofed method in the query string: `update.form(user)` returns `{ action: "/users/1?_method=PUT", method: "post" }`. `Form` accepts that too. It moves `_method` into the hidden field and keeps the other query parameters.

# With Inertia

Route objects work the same with the [Inertia router](./inertia) and with `useForm()`:

```tsx
const form = useForm({ name: "" })

<Form form={form} action={store()}>…</Form>
```

# What `action` accepts

| Value | Example | URL and method |
| --- | --- | --- |
| A URL | `"/users"` | That URL; `method` or `POST` |
| A route object | `store()` → `{ url, method }` | `url` and `method` |
| A form variant | `update.form(user)` → `{ action, method }` | `action` without `_method`; the spoofed method |
| A route function | `update` | Called with the form's `model` |

`resolveAction(action, model)` does this resolution, if you need it in your own components.
