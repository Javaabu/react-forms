"use client"

import * as React from "react"
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

import type { FormsAdapter } from "../core/adapter"
import { FormsProvider } from "../core/provider"
import { Form } from "../components/form"
import { Text, Number as NumberField, Hidden } from "../components/inputs"
import { Textarea } from "../components/textarea"
import { Checkbox, Radio } from "../components/checkbox"
import { Select, Select2 } from "../components/select"
import { Date as DateField, Time } from "../components/dates"
import { File } from "../components/files"
import { Wysiwyg } from "../components/wysiwyg"
import { Submit, LinkButton } from "../components/buttons"
import { Alert, Card, Status, Tabs, TabsPane, Accordion, TextEntry } from "../components/display"
import { Table, TableRow, TableCell, TableHeading, NoItems, Pagination } from "../components/listing"

/**
 * The adapter conformance kit. Run it in your adapter's test suite:
 *
 * ```ts
 * import { testAdapter } from "@javaabu/forms/testing"
 * testAdapter(myAdapter)
 * ```
 *
 * It renders every form component through the adapter (slots it leaves out
 * fall back to the HTML adapter) and checks what the core relies on: labels,
 * values, native submission (`FormData`), errors and their ARIA wiring, and
 * that display components render their content. It needs a DOM (jsdom or
 * happy-dom) and `@testing-library/react`.
 */

export interface ConformanceCase {
  name: string
  run: () => void | Promise<void>
}

export interface TestAdapterOptions {
  /** Test registration functions. Default: the globals of Vitest or Jest. */
  describe?: (name: string, body: () => void) => void
  it?: (name: string, body: () => void | Promise<void>) => void
  /** Case names to skip, e.g. a slot your UI kit can't render in jsdom. */
  skip?: string[]
  /** Wraps every render, e.g. your UI kit's provider. */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>
}

class ConformanceError extends Error {
  override name = "ConformanceError"
}

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new ConformanceError(message)
}

function equal(actual: unknown, expected: unknown, message: string) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  check(a === e, `${message}: expected ${e}, got ${a}`)
}

function formData(container: HTMLElement) {
  const form = container.querySelector("form")
  check(form, "the Form slot must render a <form>")
  return new FormData(form)
}

function describedByIds(el: Element) {
  return (el.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean)
}

/** The conformance cases for an adapter, to run with any test runner. */
export function adapterConformance(
  adapter: FormsAdapter,
  options: Pick<TestAdapterOptions, "wrapper"> = {},
): ConformanceCase[] {
  const Outer = options.wrapper ?? React.Fragment
  const mount = (ui: React.ReactElement) =>
    render(
      <Outer>
        <FormsProvider ui={adapter} csrfToken="test-token">
          {ui}
        </FormsProvider>
      </Outer>,
    )

  const cases: ConformanceCase[] = [
    {
      name: "Form renders a <form> with the method, action, _method and _token",
      run: () => {
        const { container } = mount(<Form method="PATCH" action="/users/1" files />)
        const form = container.querySelector("form")
        check(form, "the Form slot must render a <form>")
        equal(form.getAttribute("method")?.toUpperCase(), "POST", "method")
        equal(form.getAttribute("action"), "/users/1", "action")
        equal(form.getAttribute("enctype"), "multipart/form-data", "enctype")
        equal(formData(container).get("_method"), "PATCH", "_method")
        equal(formData(container).get("_token"), "test-token", "_token")
      },
    },
    {
      name: "Field labels the control, with help text and the required marker",
      run: () => {
        mount(
          <Form>
            <Text name="company_name" required help="As registered." />
          </Form>,
        )
        const input = screen.getByLabelText(/Company Name/)
        equal(input.getAttribute("id"), "company_name", "id")
        equal(input.getAttribute("name"), "company_name", "name")
        check((input as HTMLInputElement).required, "required controls need the required attribute")
        const help = screen.getByText("As registered.")
        const helpId = help.closest("[id]")?.id
        check(helpId && describedByIds(input).includes(helpId), "aria-describedby must point at the help text")
      },
    },
    {
      name: "Field shows errors and marks the control invalid",
      run: () => {
        mount(
          <Form errors={{ email: ["The email has already been taken."] }} summary={false}>
            <Text name="email" />
          </Form>,
        )
        const input = screen.getByLabelText(/Email/)
        equal(input.getAttribute("aria-invalid"), "true", "aria-invalid")
        const message = screen.getByText("The email has already been taken.")
        const errorId = message.closest("[id]")?.id
        check(errorId && describedByIds(input).includes(errorId), "aria-describedby must point at the errors")
      },
    },
    {
      name: "ErrorSummary lists the errors and focuses the field",
      run: async () => {
        mount(
          <Form errors={{ title: "The title field is required." }} focusOnError={false} summary>
            <Text name="title" />
          </Form>,
        )
        const links = screen.getAllByText("The title field is required.")
        check(links.length >= 2, "the summary and the field should both show the message")
        const link = links.find((el) => el.closest("a, button"))?.closest("a, button") as HTMLElement | null
        check(link, "summary entries must be links or buttons")
        fireEvent.click(link)
        await waitFor(() => equal(document.activeElement?.getAttribute("name"), "title", "focused field"))
      },
    },
    {
      name: "Input shows the bound value, reports typing and submits it",
      run: () => {
        const { container } = mount(
          <Form model={{ title: "Bodu" }}>
            <Text name="title" />
          </Form>,
        )
        const input = screen.getByLabelText(/Title/) as HTMLInputElement
        equal(input.value, "Bodu", "value from the model")
        fireEvent.change(input, { target: { value: "ބޮޑު" } })
        equal((screen.getByLabelText(/Title/) as HTMLInputElement).value, "ބޮޑު", "value after typing")
        equal(formData(container).get("title"), "ބޮޑު", "submitted value")
      },
    },
    {
      name: "Textarea shows the bound value, reports typing and submits it",
      run: () => {
        const { container } = mount(
          <Form model={{ body: "First" }}>
            <Textarea name="body" />
          </Form>,
        )
        const textarea = screen.getByLabelText(/Body/) as HTMLTextAreaElement
        equal(textarea.value, "First", "value from the model")
        fireEvent.change(textarea, { target: { value: "ދެވަނަ" } })
        equal(formData(container).get("body"), "ދެވަނަ", "submitted value")
      },
    },
    {
      name: "Number submits the bound number",
      run: () => {
        const { container } = mount(
          <Form model={{ views: 1250 }}>
            <NumberField name="views" />
          </Form>,
        )
        equal(formData(container).get("views"), "1250", "submitted value")
      },
    },
    {
      name: "Hidden submits its value",
      run: () => {
        const { container } = mount(
          <Form>
            <Hidden name="redirect" value="/users" />
          </Form>,
        )
        equal(formData(container).get("redirect"), "/users", "submitted value")
      },
    },
    {
      name: "Checkbox is checked from the model, toggles and submits its value",
      run: () => {
        const { container } = mount(
          <Form model={{ is_featured: true, channels: ["sms"] }}>
            <Checkbox name="is_featured" />
            <Checkbox name="channels[]" value="email" label="Email" />
            <Checkbox name="channels[]" value="sms" label="SMS" />
          </Form>,
        )
        equal(formData(container).get("is_featured"), "1", "checked single box")
        equal(formData(container).getAll("channels[]"), ["sms"], "checked group")
        fireEvent.click(screen.getByRole("checkbox", { name: /Email/ }))
        equal(formData(container).getAll("channels[]").sort(), ["email", "sms"], "group after a click")
        fireEvent.click(screen.getByRole("checkbox", { name: /Is Featured/ }))
        equal(formData(container).get("is_featured"), null, "unchecked single box")
      },
    },
    {
      name: "Radio is selected from the model and submits the selection",
      run: () => {
        const { container } = mount(
          <Form model={{ type: "video" }}>
            <Radio name="type" value="quiz" label="Quiz" />
            <Radio name="type" value="video" label="Video" />
          </Form>,
        )
        equal(formData(container).get("type"), "video", "selected value")
        fireEvent.click(screen.getByRole("radio", { name: /Quiz/ }))
        equal(formData(container).get("type"), "quiz", "after a click")
      },
    },
    {
      name: "Select submits the bound value",
      run: () => {
        const { container } = mount(
          <Form model={{ status: "published" }}>
            <Select name="status" options={{ draft: "Draft", published: "Published" }} />
          </Form>,
        )
        equal(formData(container).get("status"), "published", "submitted value")
      },
    },
    {
      name: "Select2 multiple submits name[] for every value",
      run: () => {
        const { container } = mount(
          <Form model={{ tags: ["1", "3"] }}>
            <Select2 name="tags" multiple options={{ 1: "Harbour", 2: "Weather", 3: "Transport" }} />
          </Form>,
        )
        equal(formData(container).getAll("tags[]").sort(), ["1", "3"], "submitted values")
      },
    },
    {
      name: "Date and Time submit Laravel's formats",
      run: () => {
        const { container } = mount(
          <Form model={{ published_on: "2026-11-04T09:30:00.000000Z", starts_at: "09:30" }}>
            <DateField name="published_on" />
            <Time name="starts_at" />
          </Form>,
        )
        const date = String(formData(container).get("published_on"))
        check(/^\d{4}-\d{2}-\d{2}$/.test(date), `published_on must be yyyy-MM-dd, got ${date}`)
        equal(formData(container).get("starts_at"), "09:30", "time")
      },
    },
    {
      name: "File renders a file input with the name",
      run: () => {
        const { container } = mount(
          <Form files>
            <File name="attachment" />
          </Form>,
        )
        const input = container.querySelector('input[type="file"]')
        check(input, "File must render <input type=file>")
        equal(input.getAttribute("name"), "attachment", "name")
      },
    },
    {
      name: "Wysiwyg submits HTML",
      run: () => {
        const { container } = mount(
          <Form model={{ content: "<p>Hello</p>" }}>
            <Wysiwyg name="content" />
          </Form>,
        )
        equal(formData(container).get("content"), "<p>Hello</p>", "submitted HTML")
      },
    },
    {
      name: "Submit submits the form and shows the processing state",
      run: async () => {
        let resolve: () => void = () => {}
        const pending = new Promise<void>((r) => (resolve = r))
        let submitted = 0
        mount(
          <Form
            onSubmit={() => {
              submitted++
              return pending
            }}
          >
            <Submit>Save</Submit>
          </Form>,
        )
        const button = screen.getByRole("button", { name: /Save/ })
        equal(button.getAttribute("type"), "submit", "type")
        fireEvent.click(button)
        await waitFor(() => equal(submitted, 1, "submits"))
        const busy = () => {
          const b = screen.getByRole("button", { name: /Save/ }) as HTMLButtonElement
          return b.disabled || b.getAttribute("aria-busy") === "true" || b.getAttribute("data-loading") !== null
        }
        await waitFor(() => check(busy(), "the button must be disabled or aria-busy while processing"))
        await act(async () => resolve())
      },
    },
    {
      name: "Display components render their content",
      run: () => {
        mount(
          <>
            <Alert type="success" heading="Saved">
              Changes saved.
            </Alert>
            <Card title="Article">Card body</Card>
            <Status color="success">Active</Status>
            <LinkButton url="/users/create">Create</LinkButton>
            <TextEntry name="name" value="Aishath" />
            <Tabs tabs={[{ name: "home" }, { name: "profile" }]}>
              <TabsPane name="home">Home pane</TabsPane>
            </Tabs>
            <Accordion id="faq" items={[{ title: "Question", content: "Answer", show: true }]} />
            <NoItems modelType="users" />
          </>,
        )
        for (const text of [
          "Saved",
          "Changes saved.",
          "Article",
          "Card body",
          "Active",
          "Aishath",
          "Home pane",
          "Question",
        ]) {
          check(screen.queryAllByText(text).length > 0, `"${text}" should be rendered`)
        }
        const link = screen.getByText("Create").closest("a")
        check(link && link.getAttribute("href") === "/users/create", "LinkButton must render a link with the URL")
      },
    },
    {
      name: "Table renders headings, rows with checkboxes and cells",
      run: () => {
        const { container } = mount(
          <Form>
            <Table model="users" headers={<TableHeading label="Name" />}>
              <TableRow model={{ id: 7, name: "Ibrahim" }}>
                <TableCell name="name" />
              </TableRow>
            </Table>
          </Form>,
        )
        check(container.querySelector("table"), "Table must render a <table>")
        check(screen.getByText("Ibrahim"), "cells show the bound value")
        const row = container.querySelector('input[name="users[]"]') as HTMLInputElement | null
        check(row && row.value === "7", "row checkboxes submit users[] with the id")
      },
    },
    {
      name: "Pagination links to pages",
      run: () => {
        const { container } = mount(
          <Pagination
            paginator={{ current_page: 2, last_page: 5, per_page: 20 }}
            getPageHref={(p) => `/users?page=${p}`}
          />,
        )
        check(container.querySelector('a[href="/users?page=3"]'), "Pagination must link to the other pages")
      },
    },
  ]

  return cases.map((c) => ({
    name: c.name,
    run: async () => {
      try {
        await c.run()
      } finally {
        cleanup()
      }
    },
  }))
}

type Registrar = (name: string, body: () => void | Promise<void>) => void

/** Registers the conformance cases as tests: `testAdapter(myAdapter)` inside a Vitest or Jest file. */
export function testAdapter(adapter: FormsAdapter, options: TestAdapterOptions = {}) {
  const g = globalThis as { describe?: TestAdapterOptions["describe"]; it?: Registrar }
  const describe = options.describe ?? g.describe
  const it = options.it ?? g.it
  if (!describe || !it)
    throw new Error("testAdapter needs describe() and it(): pass them in options, or enable globals.")
  const skip = new Set(options.skip ?? [])
  describe(`${adapter.name} adapter conformance`, () => {
    for (const c of adapterConformance(adapter, options)) {
      if (!skip.has(c.name)) it(c.name, c.run)
    }
  })
}
