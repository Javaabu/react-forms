# Listing pages

```tsx
import {
  BulkActions,
  Filter,
  FilterSubmit,
  Form,
  NoItems,
  Pagination,
  PerPage,
  Select2,
  Table,
  TableCell,
  TableEmptyRow,
  TableHeading,
  TableRow,
  Text,
} from "@javaabu/forms"
import { bulk, index, create } from "@/actions/App/Http/Controllers/ProductsController"

export default function Index({ products, filters }) {
  return (
    <>
      <Form id="filter" action={index()} model={filters}>
        <Filter>
          <Text name="search" />
          <Select2 name="status" options={{ draft: "Draft", published: "Published" }} />
          <PerPage />
          <FilterSubmit cancelUrl={index().url} export />
        </Filter>
      </Form>

      <Table
        model="products"
        bulkForm={<BulkActions actions={{ delete: "Delete", publish: "Publish" }} />}
        bulkFormAction={bulk().url}
        headers={
          <>
            <TableHeading label="Name" sortable="name" />
            <TableHeading label="Status" />
          </>
        }
        pagination={<Pagination paginator={products} />}
      >
        {products.data.length ? (
          products.data.map((product) => (
            <TableRow key={product.id} model={product}>
              <TableCell name="name" />
              <TableCell name="status" />
            </TableRow>
          ))
        ) : (
          <TableEmptyRow columns={2}>
            <NoItems modelType="products" createAction={create().url} />
          </TableEmptyRow>
        )}
      </Table>
    </>
  )
}
```

- The filter form's `id` must match `Table filterId` (default `filter`): sortable headings set its `orderby` / `order` fields and submit it.
- Row checkboxes submit `<model>[]` with each row's `id`; the select-all box toggles them.
- `BulkActions` adds the `action` select, the Apply button and a `redirect` field.
- Content inside `Table` (its `bulkForm`, `beforeTable`, rows) reads the selection with `useTableSelection()`: `{ model, selected, rows, setSelected }` (id sets), or `null` outside a table. Use it for "3 selected" or "select all"; don't count checkboxes with `FormData` or the DOM.
- `Pagination` takes a paginator or API resource collection as JSON, or a cursor paginator, and keeps the query string.
- Cells format values: enums `{ value, label, color }` as badges, booleans as Yes / No, empty as `-`, arrays joined.
- `NoItems` shows its create button when `FormsProvider authorize("create", model)` allows it, or with `showCreate`.
