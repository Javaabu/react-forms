---
title: Select2
sidebar_position: 3
---

`Select2` is a searchable select with js-utilities' `select2Custom` behaviour: server search, cascading selects, dynamic URLs and fallback inputs. It takes every [`Select`](./select-elements) prop.

```blade
<x-forms::select2 name="country" :options="$countries" />
<x-forms::select2 name="roles[]" :options="$roles" multiple />
```

```tsx
import { Form, Select2, Submit } from "@javaabu/forms"

export function UserForm({ user, countries, roles, skills, statuses }) {
  return (
    <Form model={user} action={`/users/${user.id}`} method="PATCH">
      <Select2 name="country" options={countries} />
      <Select2 name="roles" options={roles} multiple />
      <Select2 name="skills" options={skills} multiple tags />
      <Select2 name="status" options={statuses} hideSearch allowClear={false} />
      <Submit />
    </Form>
  )
}
```

With `allowClear` (the default), the placeholder defaults to "Nothing Selected" (`forms::strings.nothing_selected`).

# Server search

```tsx
<Select2 name="user_id" isAjax ajaxUrl="/api/users" options={selectedUser ? [selectedUser] : []} />
```

This requests `ajaxUrl?filter[search]=<text>&fields=id,name` and reads a JSON list or a resource collection's `data`. Pass the current option in `options`, so it has a label before the first search. `minChars` sets the shortest search. `idField` and `nameField` change the keys read from the response.

# Cascading selects

The parent names its children with `child`, or the child names its parent with `parent`. Whenever the parent changes, the child loads `ajaxUrl?filter[<filterField>]=<value>&per_page=-1&fields=id,name`. `:value` in the URL is replaced with the parent's value.

```tsx
<Form model={address}>
  <Select2 name="country" options={countries} child="#state" />
  <Select2 name="state" id="state" options={states} ajaxUrl="/api/states" child="#city" filterField="country" />
  <Select2 name="city" id="city" options={cities} ajaxUrl="/api/cities" filterField="state" fallback="#city-name" />
  <Text name="city_name" id="city-name" placeholder="ރަށުގެ ނަން ލިޔުއްވާ" />
</Form>
```

The child is disabled until its parent has a value. While loading, it is disabled and shows "Loading...". It keeps its value when the value is still in the new list.

**Fallback.** When the parent's value has no options, the select is hidden and disabled, and the `fallback` input (by `#id` or name) is shown and enabled. When the parent is empty, the fallback is enabled only if the parent itself fell back.

# Dynamic URLs

The parent's value picks the child's URL from an object (or its JSON):

```tsx
<Select2 name="type" ajaxChild="#entity" options={{ users: "Users", posts: "Posts" }} />
<Select2 name="entity_id" id="entity" isAjax ajaxUrl={{ users: "/api/users", posts: "/api/posts" }} />
```

A new URL clears the child, and the child is disabled until the parent has a value. `selectedUrl` picks the key to use before the parent has one.

# Props

All `Select` props, plus:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowClear` | `boolean` | `true` | Show a clear button. |
| `hideSearch` | `boolean` | `false` | No search box. |
| `isAjax` | `boolean` | `false` | Search on the server. Needs `ajaxUrl`. |
| `ajaxUrl` | `string \| Record<string, string>` | | The endpoint, or endpoints by the `ajaxChild` parent's value. |
| `selectedUrl` | `string` | | Key of `ajaxUrl` to use before a parent picks one. |
| `child`, `ajaxChild` | `string` | | Fields that depend on this one (`#id` or name). |
| `parent` | `string` | | The field this one depends on. |
| `filterField` | `string` | | Sends the parent's value as `filter[<filterField>]`. |
| `fallback` | `string` | | An input shown when the parent's value has no options. |
| `minChars` | `number` | | Shortest search with `isAjax`. |

Fields are found by `#id` or name anywhere on the page, including plain inputs you wrote yourself.

# How it renders

The HTML adapter renders a native `<select>` with a search box above it (Enter picks the first match, or adds the text with `tags`). The Onu adapter uses Onu's `SearchableSelect`, and `ApiSelect` for server search. The shadcn adapter uses the shadcn combobox (`Popover` + `Command`), and plain `Select` for `hideSearch`.

# Accessibility

You can type to search and use the arrow keys to move through the list. The select is labelled by the field's label.
