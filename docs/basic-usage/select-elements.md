---
title: Select elements
sidebar_position: 4
---

```blade
<x-forms::select name="country_code" :options="$countries" />
<x-forms::select name="tags[]" :options="$tags" multiple relation />
```

```tsx
import { Form, Select, Submit } from "@javaabu/forms"

export function ArticleForm({ article, countries, tags }) {
  return (
    <Form model={article} action={`/articles/${article.id}`} method="PATCH">
      <Select name="country_code" options={countries} />
      <Select name="atoll" options={{ K: "ކ. އަތޮޅު", S: "ސ. އަތޮޅު" }} placeholder="Choose..." />
      <Select name="tags[]" options={tags} multiple relation />
      <Submit />
    </Form>
  )
}
```

# Options

`options` takes the shapes Laravel sends:

| Shape | Example | Values |
| --- | --- | --- |
| key → label | `{ be: "Belgium", nl: "The Netherlands" }` | the keys |
| PHP list | `["a", "b"]` | `0`, `1` (as in Blade) |
| ordered pairs | `[[10, "Ten"], [5, "Five"]]` | the first items, in order |
| records (an Eloquent collection) | `[{ id: 1, name: "Malé" }]` | `idField` / `nameField` (default `id` / `name`) |
| options | `[{ value: "1", label: "Malé" }]` | `value` |
| a `Map` | `new Map([[1, "Malé"]])` | the keys |

JavaScript objects put integer keys first, in ascending order. Use pairs when the order of numeric keys matters.

You can also write `<option>` children, as in Blade's slot:

```tsx
<Select name="country_code">
  <option value="be">Belgium</option>
  <option value="nl">The Netherlands</option>
</Select>
```

# Selected value

The order is old input, then `default`, then the bound value. Note that `default` wins over the bound value here, as in Blade's `Select`.

A bound model object selects its key (`idField` or `id`), a collection its keys, and an enum `{ value }` its value. With `relation`, a `BelongsTo` reads the foreign key (`country` reads `country_id`), or the loaded model's key when there is no foreign key. A many relation reads the loaded models' keys:

```tsx
<Form model={video}>
  <Select name="category" options={categories} relation />
  <Select name="tags[]" options={tags} multiple relation />
</Form>
```

# Multiple values

`multiple` submits `name[]`, adding the brackets when the name doesn't have them. It also adds a `sync_<name>` hidden input (value `1`), so Laravel can tell "none selected" from "not submitted". `excludeSyncField` removes it and `syncFieldName` renames it. A disabled select has no sync input.

# Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | see above | | |
| `children` | `<option>` elements | | Used when `options` is empty. |
| `multiple` | `boolean` | `false` | Several values; submits `name[]`. |
| `relation` | `boolean` | `false` | Read the value from a relation. |
| `nameField`, `idField` | `string` | `name`, `id` | Keys of record options. |
| `placeholder` | `string` | | Shown when nothing is selected. |
| `showPlaceholder` | `boolean` | `false` | Use the label as the placeholder. |
| `clearable` | `boolean` | with a `placeholder` | Let users clear the value. A required single select can't be cleared. |
| `tags` | `boolean` | `false` | Let users add values that are not in the list. |
| `excludeSyncField`, `syncFieldName` | `boolean`, `string` | | The `sync_<name>` input. |
| `value`, `onValueChange` | `string \| string[] \| null`, `(value) => void` | | Controlled value. |
| `className` | `string` | | |

Plus the common field props ([Inputs](./inputs-and-textarea#props)). For search, server search and cascading selects, use [Select2](./select2).

# How it renders

The HTML adapter renders a native `<select>` (`multiple` for several values). The Onu adapter uses Onu's `Select`, and its `SearchableSelect` for multiple values and tags. The shadcn adapter uses your `Select`, and the combobox (`Popover` + `Command`) for multiple values and tags.

# Accessibility

The select is labelled by the field's label, and its errors are linked with `aria-describedby`.
