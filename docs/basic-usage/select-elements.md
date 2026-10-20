---
title: Select elements
sidebar_position: 4
---

```tsx
<Forms.Select name="country_code" options={{ be: "Belgium", nl: "The Netherlands" }} />
<Forms.Select name="country_code" options={countries} nameField="formatted_name" idField="code" />
<Forms.Select name="country_code">
  <option value="be">Belgium</option>
  <option value="nl">The Netherlands</option>
</Forms.Select>
<Forms.Select name="country_code[]" options={countries} multiple default={["be", "nl"]} />
<Forms.Select name="country_code" options={countries} placeholder="Choose..." />
```

## Options

`options` accepts the shapes Laravel sends:

| Shape | Example | Values |
| --- | --- | --- |
| key → label | `{ be: "Belgium" }` | the keys |
| PHP list | `["a", "b"]` | `0`, `1` (as Blade) |
| ordered pairs | `[[10, "Ten"], [5, "Five"]]` | the first items, in order |
| records (an Eloquent collection) | `[{ id: 1, name: "Malé" }]` | `idField` / `nameField` (default `id` / `name`) |
| Onu options | `[{ value: "1", label: "Malé" }]` | `value` |

## Selected value

A bound model object selects its key (`idField` or `id`), a collection its keys, and an enum `{ value }` its value. With `relation`, a `BelongsTo` reads the foreign key (`country` → `country_id`) and a many relation reads the loaded models' keys:

```tsx
<Forms.Form model={video}>
  <Forms.Select name="tags[]" options={tags} multiple relation />
</Forms.Form>
```

Multi-selects add a `sync_<name>` hidden input (value `1`) so Laravel can tell "none selected" from "not submitted". `excludeSyncField` removes it, `syncFieldName` renames it.

## Available options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | see above | | |
| `multiple` | `boolean` | `false` | Submits `name[]`. |
| `relation` | `boolean` | `false` | Read the value from a relation. |
| `nameField` / `idField` | `string` | `name` / `id` | Record keys. |
| `placeholder` | `string` | | Shown when empty; the field can be cleared when optional. |
| `tags` | `boolean` | `false` | Let users add values. |
| `excludeSyncField`, `syncFieldName` | | | The sync input. |
| `value` / `onValueChange` | | | Controlled value. |

## Accessibility

`Select` is Onu's `Select` (a listbox with type-ahead), and multi-selects are Onu's `MultiSelect` (a combobox with removable chips). Both are labelled by the field's label.
