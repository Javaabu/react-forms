---
title: Model Binding and Default Values
sidebar_position: 2
---

Fields read their starting value from the bound model, like the Blade components.

## Precedence

1. **Old input**: `Form old={…}` / `FormsProvider old={…}`, when it has the field's key.
2. **Bound value**: the model's attribute (`data_get` with the name in dot notation).
3. **`default`**: when the bound value is `null` or missing.

A controlled `value` prop wins over all three. For `Select` / `Select2`, `default` wins over the bound value, as it does in Blade.

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

Fields are uncontrolled, so they submit natively like Blade forms. When the model, old input or `default` changes (for example, data that loads after the first render), the field resets to the new value. Pass `value` and `onChange` (or `onValueChange` / `onCheckedChange`) to control a field yourself.

## Old input with Inertia

Share the flashed input and pass it once:

```php
// HandleInertiaRequests::share
'old' => fn () => $request->session()->getOldInput(),
```

```tsx
<FormsProvider old={usePage().props.old}>…</FormsProvider>
```
