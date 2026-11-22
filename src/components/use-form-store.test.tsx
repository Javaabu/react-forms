import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"

import { fakeUseForm } from "../../test/helpers"
import type { MapSlotProps } from "../core/adapter"
import { File as FileField, Image } from "./files"
import { Form } from "./form"
import { Hidden } from "./inputs"
import { MapInput } from "./map-input"
import { Select2 } from "./select"

/** A map slot with buttons in place of map clicks. */
function FakeMap(props: MapSlotProps) {
  return (
    <span>
      <button type="button" onClick={() => props.onPointChange({ lat: 4.175, lng: 73.509 })}>
        pick
      </button>
      <button
        type="button"
        onClick={() =>
          props.onPolygonsChange([
            [
              [
                [73.5, 4.1],
                [73.6, 4.1],
                [73.6, 4.2],
                [73.5, 4.1],
              ],
            ],
          ])
        }
      >
        draw
      </button>
    </span>
  )
}

function renderWithUseForm(initial: Record<string, unknown>, children: React.ReactNode, props = {}) {
  const fake = fakeUseForm(initial)
  function Page() {
    const form = fake.useFake()
    return (
      <Form form={form as never} action="/x" files components={{ Map: FakeMap }} {...props}>
        {children}
      </Form>
    )
  }
  return { ...render(<Page />), latest: fake.latest }
}

describe("fields that write to a useForm() store", () => {
  it("puts picked files and hidden values in the store", async () => {
    const { container, latest } = renderWithUseForm(
      {},
      <>
        <Hidden name="token" value="ތޯކަން" />
        <FileField name="doc" />
      </>,
    )
    const file = new globalThis.File(["x"], "ލިޔުން.pdf", { type: "application/pdf" })
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } })
    await act(async () => {})
    expect(latest.data.doc).toBe(file)
    expect(latest.data.token).toBe("ތޯކަން")
  })

  it("puts every file of a multiple input in the store", async () => {
    const { container, latest } = renderWithUseForm({}, <FileField name="docs" multiple />)
    const input = container.querySelector('input[type="file"]')!
    const a = new globalThis.File(["a"], "a.pdf", { type: "application/pdf" })
    const b = new globalThis.File(["b"], "b.pdf", { type: "application/pdf" })
    fireEvent.change(input, { target: { files: [a, b] } })
    await act(async () => {})
    expect(latest.data.docs).toEqual([a, b])
  })

  it("puts a picked image in the store", async () => {
    const { container, latest } = renderWithUseForm({}, <Image name="photo" label="ފޮޓޯ" />)
    const file = new globalThis.File(["x"], "a.png", { type: "image/png" })
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } })
    await act(async () => {})
    expect(latest.data.photo).toBe(file)
    fireEvent.click(screen.getByText("Remove"))
    await act(async () => {})
    expect(latest.data.photo).toBeNull()
  })

  it("leaves upload inputs out of the store", async () => {
    const { container, latest } = renderWithUseForm({}, <FileField name="doc" upload onUploaded={() => {}} />)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}")),
    )
    const file = new globalThis.File(["x"], "a.pdf", { type: "application/pdf" })
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } })
    await act(async () => {})
    expect("doc" in latest.data).toBe(false)
    vi.unstubAllGlobals()
  })

  it("puts a multi-select's sync field in the store", async () => {
    const { latest } = renderWithUseForm(
      { tags: ["1"] },
      <Select2 name="tags" multiple options={{ 1: "ބަނދަރު", 2: "މޫސުން" }} />,
    )
    await act(async () => {})
    expect(latest.data.sync_tags).toBe("1")
    expect(latest.data.tags).toEqual(["1"])
  })

  it("updates a hidden value in the store when it changes", async () => {
    const fake = fakeUseForm({})
    function Page({ value }: { value: string }) {
      const form = fake.useFake()
      return (
        <Form form={form as never} action="/x">
          <Hidden name="step" value={value} />
        </Form>
      )
    }
    const { rerender } = render(<Page value="1" />)
    await act(async () => {})
    expect(fake.latest.data.step).toBe("1")
    rerender(<Page value="2" />)
    await act(async () => {})
    expect(fake.latest.data.step).toBe("2")
  })

  it("puts a point picked on the map in the store", async () => {
    const { latest } = renderWithUseForm({}, <MapInput name="location" />)
    fireEvent.click(screen.getByText("pick"))
    await act(async () => {})
    expect(latest.data.lat).toBe(4.175)
    expect(latest.data.lng).toBe(73.509)
  })

  it("puts a point picked on the map in the store with hidden inputs", async () => {
    const { latest } = renderWithUseForm({}, <MapInput name="location" hideInputs />)
    fireEvent.click(screen.getByText("pick"))
    await act(async () => {})
    expect(latest.data.lat).toBe("4.175")
    expect(latest.data.lng).toBe("73.509")
  })

  it("puts a drawn boundary in the store", async () => {
    const { latest } = renderWithUseForm({}, <MapInput name="area" enablePolygon />)
    fireEvent.click(screen.getByText("draw"))
    await act(async () => {})
    expect(latest.data.boundary).toMatch(/^POLYGON/)
  })

  it("clears a picked file when the form resets", async () => {
    const fake = fakeUseForm({})
    function Page() {
      const form = fake.useFake()
      return (
        <Form form={form as never} action="/x" files resetOnSuccess>
          <FileField name="doc" />
          <button type="submit">go</button>
        </Form>
      )
    }
    const { container } = render(<Page />)
    const before = container.querySelector('input[type="file"]')!
    fireEvent.change(before, { target: { files: [new globalThis.File(["x"], "a.pdf")] } })
    fireEvent.click(screen.getByText("go"))
    const options = fake.calls.submit[0]![2] as { onSuccess: (page: unknown) => void }
    act(() => options.onSuccess({}))
    expect(container.querySelector('input[type="file"]')).not.toBe(before)
  })
})
