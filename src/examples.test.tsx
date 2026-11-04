import { render, screen } from "@testing-library/react"

import { Demo } from "../examples/shared/demo"
import { FormsProvider, mergeAdapters } from "."
import { html } from "./html"
import { onu } from "./onu"
import { onuEditor } from "./onu-editor"

// The example pages render every component; they should render without errors on each adapter.
describe.each([
  ["html", html],
  ["onu", mergeAdapters(onu, onuEditor)],
])("the example page on %s", (_, ui) => {
  it("renders every component", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <FormsProvider ui={ui}>
        <Demo title="Demo" />
      </FormsProvider>,
    )
    expect(screen.getByRole("heading", { name: "Demo" })).toBeInTheDocument()
    expect(screen.getAllByText("The slug has already been taken.").length).toBeGreaterThan(0)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })
})
