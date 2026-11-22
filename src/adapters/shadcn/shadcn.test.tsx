import { act, fireEvent, render, screen } from "@testing-library/react"

import * as ui from "../../../test/shadcn"
import { Form } from "../../components/form"
import { Select, Select2 } from "../../components/select"
import { Status } from "../../components/display"
import { Submit } from "../../components/buttons"
import { Radio } from "../../components/checkbox"
import { Accordion, AccordionItem } from "../../components/display"
import { Text } from "../../components/inputs"
import { FormsProvider } from "../../core/provider"
import { testAdapter } from "../../testing"
import { createShadcnAdapter } from "."

// Every stock component, as `import * as ui` from an app's components/ui would give.
const shadcn = createShadcnAdapter(ui)

testAdapter(shadcn)

describe("the shadcn adapter", () => {
  it("only fills the slots whose components are given", () => {
    const partial = createShadcnAdapter({ Input: ui.Input })
    const layout = ["DescriptionItem", "DescriptionList", "EmptyState", "Form"]
    expect(Object.keys(partial.components).sort()).toEqual(["Date", "File", "Input", "Number", ...layout].sort())
    expect(Object.keys(createShadcnAdapter({}).components).sort()).toEqual(layout)
  })

  it("renders shadcn's own markup", () => {
    render(
      <FormsProvider ui={shadcn}>
        <Form errors={{ status: "Pick one." }} summary={false}>
          <Select name="status" options={{ draft: "Draft", published: "Published" }} />
          <Status color="danger">Rejected</Status>
          <Submit color="danger">Delete</Submit>
        </Form>
      </FormsProvider>,
    )
    expect(document.querySelector("[data-slot=select-trigger]")).toHaveAttribute("aria-invalid", "true")
    expect(document.querySelector("[data-slot=field-error]")).toHaveTextContent("Pick one.")
    expect(screen.getByText("Rejected")).toHaveAttribute("data-slot", "badge")
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("data-variant", "destructive")
  })

  it("picks values in the combobox for searchable and multiple selects", () => {
    const { container } = render(
      <FormsProvider ui={shadcn}>
        <Form>
          <Select2 name="tags" multiple tags options={{ 1: "ބަނދަރު", 2: "މޫސުން" }} />
        </Form>
      </FormsProvider>,
    )
    fireEvent.click(screen.getByRole("combobox"))
    fireEvent.click(screen.getByText("މޫސުން"))
    expect(new FormData(container.querySelector("form")!).getAll("tags[]")).toEqual(["2"])
  })

  it("renders a radio whose value is empty as unchecked unless it is selected", () => {
    const { container } = render(
      <FormsProvider ui={shadcn}>
        <Form>
          <Radio name="kind" value="" label="ނެތް" />
          <Radio name="kind" value="a" label="A" default />
        </Form>
      </FormsProvider>,
    )
    const states = () => [...container.querySelectorAll('[role="radio"]')].map((r) => r.getAttribute("aria-checked"))
    expect(states()).toEqual(["false", "true"])
    expect(new FormData(container.querySelector("form")!).getAll("kind")).toEqual(["a"])
    fireEvent.click(container.querySelector('[role="radio"]')!)
    expect(states()).toEqual(["true", "false"])
    expect(new FormData(container.querySelector("form")!).getAll("kind")).toEqual([""])
  })

  it("hides closed accordion panels and keeps their fields in the form", () => {
    const { container } = render(
      <FormsProvider ui={shadcn}>
        <Form>
          <Accordion id="sections">
            <AccordionItem name="first" title="ފުރަތަމަ" show>
              <Text name="first" default="1" />
            </AccordionItem>
            <AccordionItem name="second" title="ދެވަނަ">
              <Text name="second" default="ދެ" />
            </AccordionItem>
          </Accordion>
        </Form>
      </FormsProvider>,
    )
    const first = container.querySelector('input[name="first"]')!
    const second = container.querySelector('input[name="second"]')!
    expect(first.closest("[hidden]")).toBeNull()
    expect(second.closest("[hidden]")).not.toBeNull()
    expect(new FormData(container.querySelector("form")!).get("second")).toBe("ދެ")
    fireEvent.click(screen.getByRole("button", { name: "ދެވަނަ" }))
    expect(second.closest("[hidden]")).toBeNull()
    expect(first.closest("[hidden]")).not.toBeNull()
  })

  it("keeps the label of a remote option after the search is cleared", async () => {
    vi.stubGlobal(
      "fetch",
      // The first page for an empty search doesn't hold the picked option.
      vi.fn(async (url: string) =>
        Response.json({
          data: url.includes("filter%5Bsearch%5D=ma") ? [{ id: 7, name: "މާލެ" }] : [{ id: 1, name: "އައްޑޫ" }],
        }),
      ),
    )
    const { container } = render(
      <FormsProvider ui={shadcn}>
        <Form>
          <Select2 name="city" isAjax ajaxUrl="/api/cities" />
        </Form>
      </FormsProvider>,
    )
    fireEvent.click(screen.getByRole("combobox"))
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "ma" } })
    fireEvent.click(await screen.findByText("މާލެ", {}, { timeout: 2000 }))
    expect(new FormData(container.querySelector("form")!).get("city")).toBe("7")
    await act(async () => void (await new Promise((r) => setTimeout(r, 400))))
    expect(fetch).toHaveBeenLastCalledWith(expect.not.stringContaining("=ma"), expect.anything())
    expect(screen.getByRole("combobox")).toHaveTextContent("މާލެ")
    vi.unstubAllGlobals()
  })

  it("clears a clearable simple select", () => {
    const { container } = render(
      <FormsProvider ui={shadcn}>
        <Form model={{ status: "draft" }}>
          <Select name="status" placeholder="ހޮވާ" options={{ draft: "ޑްރާފްޓް", published: "ޝާއިޢު" }} />
          <Select name="kind" required placeholder="ހޮވާ" options={{ a: "A" }} default="a" />
        </Form>
      </FormsProvider>,
    )
    const data = () => new FormData(container.querySelector("form")!)
    expect(data().get("status")).toBe("draft")
    // Only the optional select is clearable.
    expect(screen.getAllByRole("button", { name: "Clear" })).toHaveLength(1)
    fireEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(data().get("status")).toBe("")
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull()
  })
})
