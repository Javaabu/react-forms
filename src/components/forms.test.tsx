import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { FormsProvider } from "../context/forms-provider"
import { Model } from "../context/binding"
import { Checkbox, Radio } from "./checkbox"
import { ConditionalWrapper, TextEntry } from "./display"
import { File } from "./files"
import { Form } from "./form"
import { Email, Hidden, Input, Password, Text } from "./inputs"
import { Table, TableCell, TableRow } from "./listing"
import { Select, Select2 } from "./select"
import { Textarea } from "./textarea"

function formData(container: HTMLElement) {
  return new FormData(container.querySelector("form")!)
}

describe("Form", () => {
  it("spoofs the method and adds the CSRF token", () => {
    const { container } = render(
      <FormsProvider csrfToken="secret">
        <Form method="patch" files action="/users/1" />
      </FormsProvider>,
    )
    const form = container.querySelector("form")!
    expect(form.getAttribute("method")).toBe("POST")
    expect(form.getAttribute("enctype")).toBe("multipart/form-data")
    expect(formData(container).get("_method")).toBe("PATCH")
    expect(formData(container).get("_token")).toBe("secret")
  })

  it("adds neither to GET forms", () => {
    const { container } = render(
      <FormsProvider csrfToken="secret">
        <Form method="get" />
      </FormsProvider>,
    )
    expect(formData(container).has("_token")).toBe(false)
    expect(formData(container).has("_method")).toBe(false)
  })
})

describe("Input", () => {
  it("generates the label and id from the name", () => {
    render(<Input name="company_name" />)
    const input = screen.getByLabelText("Company Name")
    expect(input).toHaveAttribute("id", "company_name")
    expect(input).toHaveAttribute("name", "company_name")
  })

  it("translates generated labels", () => {
    render(
      <FormsProvider translate={(text) => `t:${text}`}>
        <Text name="title" />
      </FormsProvider>,
    )
    expect(screen.getByLabelText("t:Title")).toBeInTheDocument()
  })

  it("uses old input, then the bound model, then the default", () => {
    render(
      <Form model={{ name: "From model", city: null }} old={{ email: "old@example.com" }}>
        <Text name="name" default="Default" />
        <Text name="city" default="Default city" />
        <Email name="email" model={{ email: "model@example.com" }} />
        <Text name="nested[value]" model={{ nested: { value: "deep" } }} />
        <Text name="unbound" model={false} default="Fallback" />
      </Form>,
    )
    expect(screen.getByLabelText("Name")).toHaveValue("From model")
    expect(screen.getByLabelText("City")).toHaveValue("Default city")
    expect(screen.getByLabelText("Email")).toHaveValue("old@example.com")
    expect(screen.getByLabelText("Nested Value")).toHaveValue("deep")
    expect(screen.getByLabelText("Unbound")).toHaveValue("Fallback")
  })

  it("binds nested models with Model", () => {
    render(
      <Form model={{ name: "Ali", profile: { bio: "Hello" } }}>
        <Model model={{ bio: "From profile" }}>
          <Textarea name="bio" />
        </Model>
        <Text name="name" />
      </Form>,
    )
    expect(screen.getByLabelText("Bio")).toHaveValue("From profile")
    expect(screen.getByLabelText("Name")).toHaveValue("Ali")
  })

  it("never pre-fills passwords", () => {
    render(<Password name="password" model={{ password: "secret" }} />)
    expect(screen.getByLabelText("Password")).toHaveValue("")
  })

  it("shows the required marker and server errors", () => {
    render(
      <Form errors={{ title: "The title field is required." }}>
        <Text name="title" required />
        <Text name="slug" showErrors={false} />
      </Form>,
    )
    expect(screen.getByLabelText(/Title/)).toBeRequired()
    expect(screen.getAllByText("The title field is required.").length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/Title/)).toHaveAttribute("aria-invalid", "true")
  })

  it("hides errors with showErrors={false}", () => {
    render(
      <Form errors={{ slug: "Taken." }} summary={false}>
        <Text name="slug" showErrors={false} />
      </Form>,
    )
    expect(screen.queryByText("Taken.")).not.toBeInTheDocument()
  })

  it("keeps the label for screen readers with showLabel={false}", () => {
    render(<Text name="search" showLabel={false} showPlaceholder />)
    const input = screen.getByLabelText("Search")
    expect(input).toHaveAttribute("placeholder", "Search")
  })

  it("renders hidden inputs with the bound value", () => {
    const { container } = render(
      <Form model={{ redirect: "/back" }}>
        <Hidden name="redirect" />
      </Form>,
    )
    expect(formData(container).get("redirect")).toBe("/back")
  })
})

describe("Checkbox and Radio", () => {
  it("checks from a boolean model value and falls back to default", () => {
    render(
      <Form model={{ newsletter: false, notify: true, other: null }}>
        <Checkbox name="newsletter" default />
        <Checkbox name="notify" />
        <Checkbox name="other" default />
      </Form>,
    )
    expect(screen.getByRole("checkbox", { name: "Newsletter" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Notify" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Other" })).toBeChecked()
  })

  it("checks groups from an array and gives each a unique id", () => {
    render(
      <Form model={{ channels: ["email"] }}>
        <Checkbox name="channels[]" value="email" label="Email" />
        <Checkbox name="channels[]" value="sms" label="SMS" />
      </Form>,
    )
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Email" })).toHaveAttribute("id", "channels-email")
    expect(screen.getByRole("checkbox", { name: "SMS" })).not.toBeChecked()
  })

  it("follows old input over the model", () => {
    render(
      <Form model={{ notify: true }} old={{ title: "x" }}>
        <Checkbox name="notify" />
      </Form>,
    )
    expect(screen.getByRole("checkbox", { name: "Notify" })).not.toBeChecked()
  })

  it("renders radios as a native group", () => {
    render(
      <Form model={{ type: "quiz" }}>
        <Radio name="type" value="quiz" label="Quiz" />
        <Radio name="type" value="video" label="Video" />
      </Form>,
    )
    expect(screen.getByRole("radio", { name: "Quiz" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Video" })).not.toBeChecked()
  })
})

describe("Select", () => {
  it("selects the bound model key and submits it", () => {
    const { container } = render(
      <Form model={{ country: { id: 2, name: "Maldives" } }}>
        <Select
          name="country"
          options={[
            { id: 1, name: "Belgium" },
            { id: 2, name: "Maldives" },
          ]}
        />
      </Form>,
    )
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveTextContent("Maldives")
    expect(formData(container).get("country")).toBe("2")
  })

  it("lets default win over the model, as Blade's select does", () => {
    const { container } = render(
      <Form model={{ status: "draft" }}>
        <Select name="status" options={{ draft: "Draft", published: "Published" }} default="published" />
      </Form>,
    )
    expect(formData(container).get("status")).toBe("published")
  })

  it("adds the sync field to multi-selects", () => {
    const { container } = render(
      <Form model={{ tags: [{ id: 1 }, { id: 3 }] }}>
        <Select2 name="tags[]" multiple options={{ 1: "One", 2: "Two", 3: "Three" }} />
      </Form>,
    )
    const data = formData(container)
    expect(data.getAll("tags[]")).toEqual(["1", "3"])
    expect(data.get("sync_tags")).toBe("1")
  })

  it("reads <option> children", () => {
    render(
      <Select name="size" default="m">
        <option value="s">Small</option>
        <option value="m">Medium</option>
      </Select>,
    )
    expect(screen.getByRole("combobox", { name: "Size" })).toHaveTextContent("Medium")
  })
})

describe("ConditionalWrapper", () => {
  it("enables the section when the watched field has the value", async () => {
    render(
      <Form>
        <Text name="type" id="type" />
        <ConditionalWrapper enableElem="#type" enableValue="quiz" hideFields>
          <Text name="expires_at" />
        </ConditionalWrapper>
      </Form>,
    )
    const section = document.querySelector("[data-slot=conditional-display]")!
    expect(section).toHaveAttribute("data-state", "hidden")
    await userEvent.type(screen.getByLabelText("Type"), "quiz")
    await waitFor(() => expect(section).toHaveAttribute("data-state", "enabled"))
  })

  it("follows a checkbox with enableCheckbox, inverted with disable", async () => {
    render(
      <Form>
        <Checkbox name="online" id="online" />
        <ConditionalWrapper enableElem="#online" enableCheckbox disable>
          <Text name="venue" />
        </ConditionalWrapper>
      </Form>,
    )
    const section = document.querySelector("[data-slot=conditional-display]")!
    expect(section).toHaveAttribute("data-state", "enabled")
    await userEvent.click(screen.getByRole("checkbox", { name: "Online" }))
    await waitFor(() => expect(section).toHaveAttribute("data-state", "disabled"))
  })
})

describe("Select2 cascade", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("loads the child's options for the parent's value", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const island = new URL(url, "http://localhost").searchParams.get("filter[atoll]")
      const data = island === "1" ? [{ id: 10, name: "Malé" }] : []
      return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } })
    })
    vi.stubGlobal("fetch", fetchMock)

    render(
      <Form model={{ atoll: "1" }}>
        <Select2 name="atoll" options={{ 1: "Kaafu", 2: "Alifu" }} child="#island" />
        <Select2 name="island" id="island" ajaxUrl="/api/islands" filterField="atoll" fallback="#island-name" />
        <Text name="island" id="island-name" label="Island name" />
      </Form>,
    )

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const url = new URL(fetchMock.mock.calls[0]![0], "http://localhost")
    expect(url.pathname).toBe("/api/islands")
    expect(url.searchParams.get("filter[atoll]")).toBe("1")
    expect(url.searchParams.get("per_page")).toBe("-1")
    await waitFor(() => expect(screen.getByLabelText("Island name")).toBeDisabled())
  })
})

describe("Table", () => {
  it("selects all rows with the header checkbox", async () => {
    render(
      <Form>
        <Table model="users" noBulk headers={<th>Name</th>}>
          <TableRow model={{ id: 1, name: "Ali" }}>
            <TableCell name="name" />
          </TableRow>
          <TableRow model={{ id: 2, name: "Aisha" }}>
            <TableCell name="name" />
          </TableRow>
        </Table>
      </Form>,
    )
    expect(screen.getByText("Ali")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("checkbox", { name: "Select All" }))
    const rows = screen.getAllByRole("row").slice(1)
    for (const row of rows) expect(within(row).getByRole("checkbox")).toBeChecked()
    await userEvent.click(within(rows[0]!).getByRole("checkbox"))
    expect(screen.getByRole("checkbox", { name: "Select All" })).not.toBeChecked()
  })
})

describe("TextEntry", () => {
  it("formats values like FormatsValues", () => {
    render(
      <Model model={{ active: true, notes: "", status: { value: "draft", label: "Draft" }, tags: ["a", "b"] }}>
        <TextEntry name="active" />
        <TextEntry name="notes" />
        <TextEntry name="status" />
        <TextEntry name="tags" />
      </Model>,
    )
    expect(screen.getByText("Yes")).toBeInTheDocument()
    expect(screen.getByText("-")).toBeInTheDocument()
    expect(screen.getByText("Draft")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })
})

describe("File", () => {
  it("shows the hint and links to the current media", () => {
    render(
      <FormsProvider settings={{ max_upload_file_size: 2048 }}>
        <File
          name="attachment"
          model={{
            media: [{ collection_name: "attachment", original_url: "/storage/1/report.pdf", file_name: "report.pdf" }],
          }}
        />
      </FormsProvider>,
    )
    expect(screen.getByText("Only .pdf, .jpeg and .png files of max 2MB allowed.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /report\.pdf/ })).toHaveAttribute("href", "/storage/1/report.pdf")
  })
})

describe("locales", () => {
  it("is safe to change a field's value from outside", () => {
    const { rerender } = render(<Text name="title" model={{ title: "One" }} />)
    expect(screen.getByLabelText("Title")).toHaveValue("One")
    act(() => rerender(<Text name="title" model={{ title: "Two" }} />))
    expect(screen.getByLabelText("Title")).toHaveValue("Two")
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Typed" } })
    expect(screen.getByLabelText("Title")).toHaveValue("Typed")
  })
})
