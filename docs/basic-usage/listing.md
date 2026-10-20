---
title: Listing pages
sidebar_position: 9
---

```tsx
<Forms.Form method="GET" id="filter" model={query}>
  <Forms.Filter>
    <Forms.Text name="search" />
    <Forms.PerPage />
    <Forms.FilterSubmit cancelUrl="/users" export={{ xlsx: "Excel", csv: "CSV" }} />
  </Forms.Filter>
</Forms.Form>

<Forms.Table
  model="users"
  bulkFormAction="/users/bulk"
  bulkForm={<Forms.BulkActions actions={{ delete: "Delete", activate: "Activate" }} />}
  headers={
    <>
      <Forms.TableHeading label="Name" sortable="name" />
      <Forms.TableHeading label="Status" />
    </>
  }
  pagination={<Forms.Pagination paginator={users} />}
>
  {users.data.length ? (
    users.data.map((user) => (
      <Forms.TableRow key={user.id} model={user}>
        <Forms.TableCell name="name" />
        <Forms.TableCell name="status" />
      </Forms.TableRow>
    ))
  ) : (
    <Forms.TableEmptyRow columns={2}>
      <Forms.NoItems modelType="users" createAction="/users/create" model="user" />
    </Forms.TableEmptyRow>
  )}
</Forms.Table>
```

- **Selection** (js-utilities' `selectAllCheckbox`): row checkboxes submit `<model>[]` with the row's `id`. The header checkbox selects every row and shows a mixed state for a partial selection.
- **Sorting** (`sortable`): a sortable heading sets `orderby` / `order` on the form with id `filterId` (default `filter`) and submits it. Without that form, it updates the URL. The current sort comes from the URL.
- **Bulk actions**: with `bulkForm`, the table sits inside a form posting to `bulkFormAction`, with `action` and `redirect` fields.
- **Export**: `FilterSubmit export` submits `download=<key>`.
- **Pagination**: pass a Laravel paginator, API resource collection or cursor paginator as JSON. Pages are links that keep the query string, or use `onPageChange`.

## Accessibility

Sortable headings are buttons and set `aria-sort` on the column. Row checkboxes are labelled with the row's id. The pagination is a navigation landmark.
