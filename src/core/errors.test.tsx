import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Checkbox } from "../components/checkbox"
import { ErrorSummary, Errors, Form } from "../components/form"
import { Text } from "../components/inputs"
import { Select2 } from "../components/select"
import {
  ValidationError,
  errorsFor,
  findField,
  getValidationErrors,
  readValidationErrors,
  selectErrorBag,
  toDotNotation,
  withoutField,
} from "./errors"
import { FormsProvider } from "./provider"
import { fetchRouter } from "./router"

describe("error helpers", () => {
  it("converts bracket names to Laravel's keys", () => {
    expect(toDotNotation("items[0][name]")).toBe("items.0.name")
    expect(toDotNotation("tags[]")).toBe("tags")
    expect(toDotNotation("email")).toBe("email")
  })

  it("finds a field's errors, including the items of an array field", () => {
    const errors = { "address.city": "Required.", tags: ["Pick one."], "tags.1": "Invalid tag.", "tags.x": "No." }
    expect(errorsFor(errors, "address[city]")).toEqual(["Required."])
    expect(errorsFor(errors, "tags[]")).toEqual(["Pick one.", "Invalid tag."])
    expect(errorsFor(errors, "tags[]", true)).toEqual(["Pick one."])
    expect(errorsFor(errors, "missing")).toEqual([])
  })

  it("picks an error bag, or the default bag's flat errors", () => {
    const page = { email: "Taken.", createUser: { name: "Required." } }
    expect(selectErrorBag(page)).toEqual({ email: "Taken." })
    expect(selectErrorBag(page, "createUser")).toEqual({ name: "Required." })
    expect(selectErrorBag(page, "missing")).toBeNull()
    expect(selectErrorBag(null)).toBeNull()
  })

  it("removes a field's errors", () => {
    const errors = { tags: "a", "tags.0": "b", title: "c" }
    expect(withoutField(errors, "tags[]")).toEqual({ title: "c" })
    expect(withoutField(errors, "other")).toBe(errors)
  })

  it("reads validation payloads from thrown values and responses", async () => {
    const body = { message: "Invalid.", errors: { email: ["Taken."] } }
    expect(getValidationErrors(body)).toEqual(body)
    expect(getValidationErrors({ response: { data: body } })).toEqual(body)
    expect(getValidationErrors(new ValidationError({ email: "Taken." }))).toEqual({ errors: { email: "Taken." } })
    expect(getValidationErrors(new Error("nope"))).toBeNull()
    const response = new Response(JSON.stringify(body), { status: 422 })
    expect(await readValidationErrors(response)).toEqual(body)
    expect(await readValidationErrors(new Response("{}", { status: 500 }))).toBeNull()
  })

  it("finds the control of an error key", () => {
    document.body.innerHTML = '<input name="items[0][name]"><input name="tags[]">'
    expect(findField(document, "items.0.name")).toBe(document.querySelector("[name='items[0][name]']"))
    expect(findField(document, "tags.2")).toBe(document.querySelector("[name='tags[]']"))
    document.body.innerHTML = ""
  })
})

describe("errors under fields", () => {
  it("show under the right field, with aria-invalid and aria-describedby", () => {
    render(
      <Form errors={{ "address.city": ["The city field is required."] }} summary={false}>
        <Text name="address[city]" />
      </Form>,
    )
    const input = screen.getByLabelText("Address City")
    expect(input).toHaveAttribute("aria-invalid", "true")
    const message = screen.getByText("The city field is required.")
    expect(input.getAttribute("aria-describedby")).toContain(message.parentElement!.id)
  })

  it("collect the item errors of array fields (tags.0 → tags[])", () => {
    render(
      <Form errors={{ "tags.0": "The tag is invalid." }} summary={false}>
        <Select2 name="tags[]" multiple options={{ 1: "Harbour" }} />
      </Form>,
    )
    expect(screen.getByText("The tag is invalid.")).toBeInTheDocument()
  })

  it("come from FormsProvider errors and the form's error bag", () => {
    render(
      <FormsProvider errors={{ email: "Taken.", createUser: { name: "ނަން ލިޔުއްވާ." } }}>
        <Form summary={false}>
          <Text name="email" />
        </Form>
        <Form errorBag="createUser" summary={false}>
          <Text name="name" />
          <Text name="email" id="bag-email" />
        </Form>
      </FormsProvider>,
    )
    expect(screen.getAllByText("Taken.")).toHaveLength(1)
    expect(screen.getByText("ނަން ލިޔުއްވާ.")).toBeInTheDocument()
  })

  it("are hidden with showErrors={false}", () => {
    render(
      <Form errors={{ slug: "Taken." }} summary={false}>
        <Text name="slug" showErrors={false} />
      </Form>,
    )
    expect(screen.queryByText("Taken.")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Slug")).not.toHaveAttribute("aria-invalid")
  })

  it("go away when the field is edited", async () => {
    render(
      <Form errors={{ title: "Required." }} summary={false}>
        <Text name="title" />
        <Checkbox name="agree" />
      </Form>,
    )
    await userEvent.type(screen.getByLabelText("Title"), "ސުރުޚީ")
    expect(screen.queryByText("Required.")).not.toBeInTheDocument()
  })

  it("show with Errors anywhere in the form, first message only by default", () => {
    render(
      <Form errors={{ terms: ["Accept the terms.", "Really."] }} summary={false}>
        <Errors name="terms" />
        <Errors name="terms" firstOnly={false} id="all" />
      </Form>,
    )
    expect(screen.getAllByText("Accept the terms.")).toHaveLength(2)
    expect(screen.getAllByText("Really.")).toHaveLength(1)
  })
})

describe("error summary", () => {
  it("lists every error with the field's label and focuses the field on click", async () => {
    render(
      <Form errors={{ title: "The title field is required.", "items.0.name": "Name the item." }} focusOnError={false}>
        <Text name="title" label="ސުރުޚީ" />
        <Text name="items[0][name]" />
      </Form>,
    )
    const summary = document.querySelector("[data-slot=error-summary]")!
    expect(summary).toHaveTextContent("Please correct the errors below.")
    const link = summary.querySelector("a[href='#items.0.name']") as HTMLAnchorElement
    fireEvent.click(link)
    await waitFor(() => expect(document.querySelector("[name='items[0][name]']")).toHaveFocus())
  })

  it("renders standalone with its own errors", () => {
    render(<ErrorSummary errors={{ email: "Taken." }} title="Fix these" />)
    expect(screen.getByText("Fix these")).toBeInTheDocument()
    expect(screen.getByText("Taken.")).toBeInTheDocument()
  })

  it("renders nothing without errors", () => {
    const { container } = render(<ErrorSummary errors={{}} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe("errors from submitting", () => {
  it("focus the first invalid field when onSubmit throws a 422", async () => {
    const onError = vi.fn()
    render(
      <Form
        onError={onError}
        onSubmit={() => {
          throw new Response(JSON.stringify({ message: "Invalid.", errors: { email: ["Taken."] } }), { status: 422 })
        }}
      >
        <Text name="title" />
        <Text name="email" />
        <button type="submit">Save</button>
      </Form>,
    )
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus())
    expect(screen.getAllByText("Taken.").length).toBeGreaterThan(0)
    expect(onError).toHaveBeenCalledWith(expect.any(Response), { message: "Invalid.", errors: { email: ["Taken."] } })
  })

  it("show a general message when the submit fails for another reason", async () => {
    render(
      <Form
        onSubmit={() => {
          throw new Error("offline")
        }}
      >
        <button type="submit">Save</button>
      </Form>,
    )
    fireEvent.click(screen.getByText("Save"))
    expect(await screen.findByText("The form could not be submitted. Please try again.")).toBeInTheDocument()
  })

  it("read Laravel's JSON 422 with the fetch router", async () => {
    class FakeXhr {
      static last: FakeXhr
      status = 0
      responseText = ""
      headers: Record<string, string> = {}
      listeners: Record<string, () => void> = {}
      upload = { addEventListener: () => {} }
      withCredentials = false
      method = ""
      url = ""
      body: unknown
      constructor() {
        FakeXhr.last = this
      }
      open(method: string, url: string) {
        this.method = method
        this.url = url
      }
      setRequestHeader(key: string, value: string) {
        this.headers[key] = value
      }
      getResponseHeader() {
        return "application/json"
      }
      addEventListener(type: string, listener: () => void) {
        this.listeners[type] = listener
      }
      send(body: unknown) {
        this.body = body
        this.status = 422
        this.responseText = JSON.stringify({ message: "Invalid.", errors: { "address.city": ["Pick a city."] } })
        setTimeout(() => this.listeners.load?.(), 0)
      }
    }
    vi.stubGlobal("XMLHttpRequest", FakeXhr)
    render(
      <FormsProvider router={fetchRouter} csrfToken="t0ken">
        <Form method="PATCH" action="/users/1">
          <Text name="address[city]" />
          <button type="submit">Save</button>
        </Form>
      </FormsProvider>,
    )
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(screen.getByLabelText("Address City")).toHaveFocus())
    expect(FakeXhr.last.method).toBe("POST")
    expect(FakeXhr.last.url).toBe("/users/1")
    expect(FakeXhr.last.headers["X-CSRF-TOKEN"]).toBe("t0ken")
    expect((FakeXhr.last.body as FormData).get("_method")).toBe("PATCH")
    expect(screen.getAllByText("Pick a city.").length).toBeGreaterThan(0)
    vi.unstubAllGlobals()
  })
})
