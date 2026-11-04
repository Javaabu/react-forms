---
title: Listing pages
sidebar_position: 9
---

The listing components build an index page: a filter form, a table with row selection, sorting and bulk actions, an empty state and pagination.

```tsx
import {
  BulkActions,
  Filter,
  FilterSubmit,
  Form,
  NoItems,
  Pagination,
  PerPage,
  Table,
  TableCell,
  TableEmptyRow,
  TableHeading,
  TableRow,
  Text,
} from "@javaabu/forms"

export default function Index({ users, query }) {
  return (
    <>
      <Form method="GET" id="filter" action="/users" model={query}>
        <Filter>
          <Text name="search" label="ހޯދާ" />
          <PerPage />
          <FilterSubmit cancelUrl="/users" export={{ xlsx: "Excel", csv: "CSV" }} />
        </Filter>
      </Form>

      <Table
        model="users"
        bulkFormAction="/users/bulk"
        bulkForm={<BulkActions actions={{ delete: "Delete", activate: "Activate" }} />}
        headers={
          <>
            <TableHeading label="Name" sortable="name" />
            <TableHeading label="Status" />
          </>
        }
        pagination={<Pagination paginator={users} />}
      >
        {users.data.length ? (
          users.data.map((user) => (
            <TableRow key={user.id} model={user}>
              <TableCell name="name" />
              <TableCell name="status" />
            </TableRow>
          ))
        ) : (
          <TableEmptyRow columns={2}>
            <NoItems modelType="users" createAction="/users/create" model="user" />
          </TableEmptyRow>
        )}
      </Table>
    </>
  )
}
```

# What each part does

- **Selection** (js-utilities' `selectAllCheckbox`). Row checkboxes submit `<model>[]` with the row's `id` (or `modelId`). The header checkbox selects every row, and shows a mixed state for a partial selection.
- **Sorting** (`sortable` on a heading, or `name`). A sortable heading sets `orderby` and `order` on the form with id `filterId` (default `filter`) and submits it. Without that form, it changes the URL. The current sort comes from the URL. `Filter` adds the hidden `orderby` and `order` fields.
- **Bulk actions.** With `bulkForm`, the table sits inside a form that posts to `bulkFormAction`. `BulkActions` adds the `action` select, an Apply button and a `redirect` field with the current URL.
- **Export.** `FilterSubmit export` adds an Export button that submits `download=<key>`: `true` (value `1`), a format, a list, or a format → label object for a menu.
- **Per page.** `PerPage` is a `per_page` select. Its value comes from `perPage`, the URL, or the `per_page` setting (`FormsProvider settings`).
- **Search.** `SearchForm` is a GET form with one search field (`name`, default `search`); its value comes from the URL.
- **Empty state.** `NoItems` shows "It's a bit lonely here." and a Create New button. The button shows when `showCreate` is true, or when `FormsProvider authorize("create", model)` allows it.
- **Pagination.** Pass a Laravel paginator, an API resource collection or a cursor paginator, as JSON. Pages are links that keep the rest of the query string. Pass `getPageHref` to build the links yourself, or `onPageChange` for buttons.

# Table props

| Prop | Default | Description |
| --- | --- | --- |
| `model` | | Name of the row checkboxes (`<model>[]`). |
| `noCheckbox` | `false` | No row checkboxes. |
| `noBulk` | `false` | No bulk actions form. |
| `noPagination` | `false` | Don't render `pagination`. |
| `striped` | `false` | Striped rows. |
| `tableClass` | | Classes for the `<table>`. |
| `filterId` | `filter` | Id of the filter form that sortable headings submit. |
| `bulkForm`, `bulkFormAction`, `bulkFormProps` | | The bulk actions form's content, action and other `Form` props. |
| `headers`, `beforeTable`, `beforeHeaders`, `afterHeaders`, `rows`, `afterTbody`, `pagination` | | Blade's named slots. `rows` or `children` are the rows. |

`TableRow` takes `model`, `modelId`, `name` (the checkbox name), `rowId`, `noCheckbox` and `disableCheckbox`. `TableCell` takes `name` (an attribute of the row's model), `value`, `label` (shown on small screens via `data-col`), `showLabel` and `multiline`; arrays are joined with `table_array_separator`. `TableEmptyRow` takes `columns` (the checkbox column is added).

# How it renders

The table parts render through the adapter's `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead` and `TableCell` slots: plain table elements in the HTML adapter, Onu's table in the Onu adapter, and your shadcn `Table` components with shadcn. The empty state and pagination use the adapter's `EmptyState` and `Pagination` slots.

# Accessibility

Sortable headings are buttons, and the column gets `aria-sort`. The header checkbox is labelled "Select All", and each row checkbox "Select <id>". The pagination is a navigation landmark, and the current page has `aria-current="page"`.
