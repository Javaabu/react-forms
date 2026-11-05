import { fireEvent, render, screen } from "@testing-library/react"

import * as ui from "../../../test/shadcn"
import { Form } from "../../components/form"
import { Select, Select2 } from "../../components/select"
import { Status } from "../../components/display"
import { Submit } from "../../components/buttons"
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
})
