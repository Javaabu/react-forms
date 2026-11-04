import { fireEvent, render, screen, within } from "@testing-library/react"

import { FormsProvider } from "../core/provider"
import { Form } from "./form"
import {
  BulkActions,
  Filter,
  FilterSubmit,
  NoItems,
  Pagination,
  PerPage,
  SearchForm,
  Table,
  TableCell,
  TableEmptyRow,
  TableHeading,
  TableRow,
} from "./listing"

const users = [
  {
    id: 1,
    name: "ޢާއިޝަތު",
    active: true,
    role: { value: "admin", label: "Admin", color: "success" },
    tags: ["a", "b"],
  },
  { id: 2, name: "އިބްރާހީމް", active: false, role: null, tags: [] },
]

function values(form: HTMLFormElement) {
  return new FormData(form)
}

describe("Table", () => {
  it("selects rows, selects all, and formats cells", () => {
    const { container } = render(
      <Form>
        <Table model="users" headers={<TableHeading label="Name" />} striped>
          {users.map((user) => (
            <TableRow key={user.id} model={user}>
              <TableCell name="name" />
              <TableCell name="active" />
              <TableCell name="role" />
              <TableCell name="tags" />
            </TableRow>
          ))}
        </Table>
      </Form>,
    )
    const form = container.querySelector("form")!
    expect(screen.getByText("ޢާއިޝަތު")).toBeInTheDocument()
    expect(screen.getByText("Yes")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toHaveAttribute("data-tone", "success")
    expect(screen.getByText("a, b")).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText("Select 1"))
    expect(values(form).getAll("users[]")).toEqual(["1"])
    const all = screen.getByLabelText("Select All") as HTMLInputElement
    expect(all.indeterminate).toBe(true)
    fireEvent.click(all)
    expect(values(form).getAll("users[]")).toEqual(["1", "2"])
    fireEvent.click(all)
    expect(values(form).getAll("users[]")).toEqual([])
  })

  it("wraps the table in a bulk actions form", () => {
    const { container } = render(
      <Table
        model="users"
        bulkForm={<BulkActions actions={{ delete: "Delete" }} />}
        bulkFormAction="/users/bulk"
        noCheckbox
      >
        <TableRow model={users[0]}>
          <TableCell name="name" />
        </TableRow>
        <TableEmptyRow columns={3}>Nothing</TableEmptyRow>
      </Table>,
    )
    const form = container.querySelector("form")!
    expect(form).toHaveAttribute("action", "/users/bulk")
    expect(within(form).getByRole("option", { name: "Delete" })).toBeInTheDocument()
    expect(values(form).get("redirect")).toBe(window.location.href)
    expect(screen.getByText("Nothing")).toHaveAttribute("colspan", "3")
    expect(container.querySelector('input[name="users[]"]')).toBeNull()
  })

  it("sorts by submitting the filter form", () => {
    const submit = vi.fn((event: Event) => event.preventDefault())
    render(
      <>
        <Form id="filter" method="GET" action="/users">
          <Filter>
            <span />
          </Filter>
        </Form>
        <Table model="users" headers={<TableHeading label="Name" sortable="name" />} />
      </>,
    )
    const form = document.getElementById("filter") as HTMLFormElement
    form.addEventListener("submit", submit)
    fireEvent.click(screen.getByRole("button", { name: "Sort by Name" }))
    expect(submit).toHaveBeenCalled()
    expect(values(form).get("orderby")).toBe("name")
    expect(values(form).get("order")).toBe("ASC")
    expect(document.querySelector("[data-sort-field=name]")).toHaveAttribute("aria-sort", "none")
  })
})

describe("filters", () => {
  it("renders the filter, export and clear buttons", () => {
    render(
      <Form>
        <FilterSubmit cancelUrl="/users" export={{ xlsx: "Excel", csv: "CSV" }} />
        <PerPage amounts={[10, 25]} perPage={50} />
      </Form>,
    )
    expect(screen.getByRole("button", { name: "Filter" })).toHaveAttribute("type", "submit")
    expect(screen.getByRole("button", { name: "Export" })).toHaveAttribute("value", "xlsx")
    expect(screen.getByText("Clear").closest("a")).toHaveAttribute("href", "/users")
    expect(screen.getByRole("menuitem", { name: "CSV" })).toBeInTheDocument()
    // The current page size is kept even when it isn't one of the amounts.
    expect(screen.getByRole("option", { name: "50" })).toBeInTheDocument()
    expect(screen.getByLabelText("Per page")).toHaveValue("50")
  })

  it("renders a single export button and a search form", () => {
    render(
      <>
        <Form>
          <FilterSubmit cancelUrl="/users" export />
        </Form>
        <SearchForm action="/users" />
      </>,
    )
    expect(screen.getByRole("button", { name: "Export" })).toHaveAttribute("value", "1")
    const search = screen.getByPlaceholderText("Search...")
    expect(search).toHaveAttribute("name", "search")
    expect(search.closest("form")).toHaveAttribute("method", "GET")
  })
})

describe("NoItems", () => {
  it("shows the create button when allowed", () => {
    render(
      <FormsProvider authorize={(ability) => ability === "create"}>
        <NoItems model="App\\Models\\User" modelType="users" createAction="/users/create" icon="fa-solid fa-users" />
      </FormsProvider>,
    )
    expect(screen.getByText("Let's create some new users.")).toBeInTheDocument()
    expect(screen.getByText("Create New").closest("a")).toHaveAttribute("href", "/users/create")
  })

  it("hides it without permission", () => {
    render(<NoItems model="App\\Models\\User" title="ހުސް" message="އެއްވެސް އެއްޗެއް ނެތް" />)
    expect(screen.getByText("ހުސް")).toBeInTheDocument()
    expect(screen.queryByText("Create New")).not.toBeInTheDocument()
  })
})

describe("Pagination", () => {
  it("links to pages of a resource collection, keeping the query", () => {
    const { container } = render(<Pagination paginator={{ meta: { current_page: 3, last_page: 9, per_page: 10 } }} />)
    expect(container.querySelector('a[href="?page=4"]')).toBeInTheDocument()
    expect(screen.getByText("…", { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText("Page 3")).toHaveAttribute("aria-current", "page")
  })

  it("calls onPageChange with buttons", () => {
    const onPageChange = vi.fn()
    render(<Pagination paginator={{ current_page: 1, last_page: 2, per_page: 10 }} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByLabelText("Next"))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("shows previous / next for cursor paginators", () => {
    render(<Pagination paginator={{ next_cursor: "abc", next_page_url: "/users?cursor=abc", prev_page_url: null }} />)
    expect(screen.getByText("Next").closest("a")).toHaveAttribute("href", "/users?cursor=abc")
    expect(screen.getByText("Previous").closest("a")).toHaveAttribute("aria-disabled", "true")
  })

  it("renders nothing for one page", () => {
    const { container } = render(<Pagination paginator={{ current_page: 1, last_page: 1, per_page: 10 }} />)
    expect(container).toBeEmptyDOMElement()
  })
})
