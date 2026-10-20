---
title: Select2
sidebar_position: 3
---

`Select2` is a searchable select (Onu `SearchableSelect`). It brings js-utilities' `select2Custom` behaviour: ajax search, cascades and fallbacks.

```tsx
<Forms.Select2 name="country" options={countries} />
<Forms.Select2 name="roles" options={roles} multiple />
<Forms.Select2 name="skills" options={skills} multiple tags />
<Forms.Select2 name="status" options={statuses} hideSearch allowClear={false} />
```

With `allowClear` (the default), the placeholder defaults to "Nothing Selected".

## Ajax search

```tsx
<Forms.Select2 name="user_id" isAjax ajaxUrl={route("api.users.index")} options={selectedUser ? [selectedUser] : []} />
```

This searches with `?filter[search]=…&fields=id,name&page=…` and reads Laravel's paginated JSON. Pass the current option in `options` so it has a label. `minChars` sets the minimum search length.

## Cascading selects

The parent names its children with `child`, or the child names its parent with `parent`. The child loads `ajaxUrl?filter[<filterField>]=<value>&per_page=-1&fields=id,name` whenever the parent changes. `:value` in the URL is replaced with the parent's value.

```tsx
<Forms.Form model={address}>
  <Forms.Select2 name="country" options={countries} child="#state" />
  <Forms.Select2 name="state" id="state" options={states} ajaxUrl={route("api.states.index")} child="#city" filterField="country" />
  <Forms.Select2 name="city" id="city" options={cities} ajaxUrl={route("api.cities.index")} filterField="state" fallback="#city-name" />
  <Forms.Text name="city" id="city-name" placeholder="Write your own city name..." />
</Forms.Form>
```

While loading, the child is disabled and shows "Loading...". It keeps its value when the value is still in the new list.

**Fallback**: when the parent's value has no options, the select is hidden and disabled, and the `fallback` input (any of this package's text inputs, by `#id` or name) is shown and enabled. When the parent is empty, the fallback is enabled only if the parent itself fell back.

## Dynamic URLs

The parent's value picks the child's URL from an object (or its JSON):

```tsx
<Forms.Select2 name="type" ajaxChild="#entity" options={{ users: "Users", posts: "Posts" }} />
<Forms.Select2 name="entity_id" id="entity" isAjax ajaxUrl={{ users: "/api/users", posts: "/api/posts" }} />
```

A new URL clears the child, and the child is disabled until the parent has a value.

## Available options

All `Select` options, plus:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowClear` | `boolean` | `true` | Clear button. |
| `hideSearch` | `boolean` | `false` | A plain select, without the search box. |
| `isAjax` | `boolean` | `false` | Search on the server. |
| `ajaxUrl` | `string \| Record<string,string>` | | Endpoint, or endpoints by parent value. |
| `selectedUrl` | `string` | | Initial key of `ajaxUrl`. |
| `child` / `ajaxChild` | `string` | | Dependent fields (`#id` or name). |
| `parent` | `string` | | The field this one depends on. |
| `filterField` | `string` | | Filter param for the parent's value. |
| `fallback` | `string` | | Input shown when there are no options. |
| `minChars` | `number` | `0` | Minimum search length with `isAjax`. |

## Accessibility

The select is an Onu combobox: you can type to search, use the arrow keys to move through the list, and the selected values are announced.
