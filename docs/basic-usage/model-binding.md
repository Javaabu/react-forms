---
title: Model Binding and Default Values
sidebar_position: 2
---

Fields read their starting value from the bound model, like the Blade components.

## Precedence

1. **Old input**: `Form old={…}` / `FormsProvider old={…}`, when it has the field's key.
2. **Bound value**: the model's attribute (`data_get` with the name in dot notation).
3. **`default`**: when the bound value is `null` or missing.

A controlled `value` prop wins over all three. Old input wins even when its value is `null`: the key was submitted, so the user emptied the field. For `Select` / `Select2`, `default` wins over the bound value, as it does in Blade.

```tsx
<Forms.Textarea name="motivation" default="I want to use this package because..." />
<Forms.Text name="title" model={post} />

<Forms.Form model={video}>
  <Forms.Text name="title" />            {/* video.title */}
  <Forms.Model model={video.profile}>
    <Forms.Textarea name="biography" /> {/* video.profile.biography */}
  </Forms.Model>
  <Forms.Text name="category_name" model={category} />
  <Forms.Textarea name="comments" model={false} />
</Forms.Form>
```

Bracket names read nested values: `name="address[city]"` reads `address.city` and submits `address[city]`.

## Fields that change after the first render

Each field keeps its own value, starting from the precedence above, and renders real inputs, so the form submits natively like a Blade form. When the model, old input or `default` changes (for example, data that loads after the first render), the field starts again from the new value. Pass `value` and `onChange` (or `onValueChange` / `onCheckedChange`) to control a field yourself.

With Inertia's `useForm()`, pass it to the form (`<Form form={form}>`) and the fields read and write `form.data` instead. See [Inertia](../advanced-usage/inertia).

## Checkboxes, radios and selects

- **Checkboxes** follow Blade: once there is any old input, a box is checked only when the old input contains its `value`. An unchecked box isn't submitted, so its key is missing. Without old input, an array (`channels: ["sms"]`) checks the boxes whose value it contains, and a scalar checks by its truthiness. `default` applies when the bound value is `null`.
- **Radios** are selected when the bound value equals their `value`.
- **`Select` / `Select2`**: `default` wins over the bound value, as in Blade. With `relation`, a bound model becomes its key (`idField`, default `id`) and a collection becomes its keys. Multiple selects submit `name[]`, plus `sync_<name>` so Laravel can sync an emptied relation (`excludeSyncField` turns that off).
- **Dates** accept what Laravel sends (`2026-11-04`, `2026-11-04 09:30:00`, ISO strings) and submit `yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss` or `HH:mm`.

## Old input with Inertia

Share the flashed input and pass it once:

```php
// HandleInertiaRequests::share
'old' => fn () => $request->session()->getOldInput(),
```

```tsx
<FormsProvider old={usePage().props.old}>…</FormsProvider>
```
