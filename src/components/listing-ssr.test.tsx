import * as React from "react"
import { act } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"

import { FormsProvider } from "../core/provider"
import { BulkActions, Filter, Pagination, PerPage, SearchForm, Table, TableHeading } from "./listing"
import { Form } from "./form"

function Listing() {
  return (
    <>
      <SearchForm action="/users" />
      <Form id="filter" method="GET">
        <Filter>
          <PerPage />
        </Filter>
      </Form>
      <Table
        model="users"
        headers={<TableHeading label="ނަން" sortable="name" />}
        bulkForm={<BulkActions actions={{ delete: "ފޮހެލާ" }} />}
      >
        {null}
      </Table>
      <Pagination paginator={{ current_page: 2, last_page: 3 }} />
    </>
  )
}

/** Renders `ui` as the server would (no `window`), then hydrates it on this page. */
async function hydrate(ui: React.ReactElement) {
  const realWindow = globalThis.window
  // @ts-expect-error -- the server has no window
  delete globalThis.window
  let html: string
  try {
    html = renderToString(ui)
  } finally {
    globalThis.window = realWindow
  }
  const container = document.createElement("div")
  container.innerHTML = html
  document.body.appendChild(container)
  const errors: unknown[] = []
  await act(async () => {
    hydrateRoot(container, ui, { onRecoverableError: (error) => errors.push(error) })
  })
  return { container, errors }
}

describe("listing components on a server-rendered page", () => {
  beforeEach(() => window.history.replaceState(null, "", "/users?search=ޢަލީ&orderby=name&order=DESC&per_page=50"))
  afterEach(() => {
    window.history.replaceState(null, "", "/")
    document.body.innerHTML = ""
  })

  it("hydrate without a mismatch, then show the URL's query", async () => {
    const { container, errors } = await hydrate(<Listing />)
    expect(errors).toEqual([])
    expect(container.querySelector<HTMLInputElement>('input[name="search"]')!.value).toBe("ޢަލީ")
    expect(container.querySelector("[data-sort-field=name]")).toHaveAttribute("aria-sort", "descending")
    expect(container.querySelector<HTMLInputElement>('input[name="redirect"]')!.value).toContain("/users?")
  })

  it("render the server's URL from a router hook or FormsProvider url", () => {
    const url = "/users?search=ޙަސަން&orderby=name&order=ASC&page=2"
    const realWindow = globalThis.window
    // @ts-expect-error -- the server has no window
    delete globalThis.window
    let html: string
    try {
      html = renderToString(
        <FormsProvider url={url}>
          <Listing />
        </FormsProvider>,
      )
    } finally {
      globalThis.window = realWindow
    }
    const container = document.createElement("div")
    container.innerHTML = html
    expect(container.querySelector<HTMLInputElement>('input[name="search"]')!.value).toBe("ޙަސަން")
    expect(container.querySelector("[data-sort-field=name]")).toHaveAttribute("aria-sort", "ascending")
    expect(container.querySelector<HTMLInputElement>('input[name="redirect"]')!.value).toBe(url)
    expect(container.querySelector('a[href*="page=3"]')!.getAttribute("href")).toContain("search=")
  })
})
