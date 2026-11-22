import { act, fireEvent, render, waitFor } from "@testing-library/react"

import { fd } from "../../test/helpers"
import { Form } from "./form"
import { Select2 } from "./select"

const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } })
const settle = () => act(async () => void (await new Promise((r) => setTimeout(r, 50))))

describe("a cascade child", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        json(url.includes("filter%5Batoll%5D=2") ? [{ id: 9, name: "ރަސްދޫ" }] : [{ id: 5, name: "މާލެ" }]),
      ),
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it("keeps its saved value on mount with parent=", async () => {
    const { container } = render(
      <Form action="/x" model={{ atoll: 1, island: 5 }}>
        <Select2 name="atoll" options={{ 1: "ކ", 2: "އއ" }} />
        <Select2 name="island" options={{ 5: "މާލެ" }} parent="atoll" ajaxUrl="/api/islands" filterField="atoll" />
      </Form>,
    )
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await settle()
    expect(fd(container).get("island")).toBe("5")
  })

  it("keeps its saved value when rendered before its parent", async () => {
    const { container } = render(
      <Form action="/x" model={{ atoll: 1, island: 5 }}>
        <Select2 name="island" options={{ 5: "މާލެ" }} parent="atoll" ajaxUrl="/api/islands" filterField="atoll" />
        <Select2 name="atoll" options={{ 1: "ކ", 2: "އއ" }} />
      </Form>,
    )
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await settle()
    expect(fd(container).get("island")).toBe("5")
  })

  it("loses its value when the parent changes", async () => {
    const { container } = render(
      <Form action="/x" model={{ atoll: 1, island: 5 }}>
        <Select2 name="atoll" options={{ 1: "ކ", 2: "އއ" }} />
        <Select2 name="island" options={{ 5: "މާލެ" }} parent="atoll" ajaxUrl="/api/islands" filterField="atoll" />
      </Form>,
    )
    await settle()
    expect(fd(container).get("island")).toBe("5")
    // The HTML adapter's select is a native <select>.
    fireEvent.change(container.querySelector('select[name="atoll"]')!, { target: { value: "2" } })
    await settle()
    expect(fd(container).get("island")).toBe("")
    expect(container.querySelector('select[name="island"] option[value="9"]')).not.toBeNull()
  })

  it("loses its value when the parent is cleared", async () => {
    const { container } = render(
      <Form action="/x" model={{ atoll: 1, island: 5 }}>
        <Select2 name="atoll" options={{ 1: "ކ", 2: "އއ" }} />
        <Select2 name="island" options={{ 5: "މާލެ" }} parent="atoll" ajaxUrl="/api/islands" filterField="atoll" />
      </Form>,
    )
    await settle()
    fireEvent.change(container.querySelector('select[name="atoll"]')!, { target: { value: "" } })
    await settle()
    fireEvent.change(container.querySelector('select[name="atoll"]')!, { target: { value: "1" } })
    await settle()
    expect(fd(container).get("island")).toBe("")
  })
})
