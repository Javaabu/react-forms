import { act, fireEvent, render, screen } from "@testing-library/react"

import { Submit } from "./buttons"
import { Form } from "./form"

const busy = (button: HTMLElement) => button.getAttribute("aria-busy") === "true"

describe("Submit", () => {
  beforeEach(() => {
    // jsdom reports the native submit it can't perform as an error.
    vi.spyOn(console, "error").mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it("stops the spinner when the page comes back from the back-forward cache", async () => {
    render(
      <Form action="/x">
        <Submit>ސޭވް</Submit>
      </Form>,
    )
    const button = screen.getByRole("button", { name: "ސޭވް" })
    fireEvent.click(button)
    await act(async () => void (await new Promise((r) => setTimeout(r))))
    expect(busy(button)).toBe(true)
    act(() => void window.dispatchEvent(new Event("pageshow")))
    expect(busy(button)).toBe(false)
  })

  it("stops the spinner when its own handler prevented the submit", async () => {
    render(
      <form onSubmit={(e) => e.preventDefault()}>
        <Submit>ސޭވް</Submit>
      </form>,
    )
    const button = screen.getByRole("button", { name: "ސޭވް" })
    fireEvent.click(button)
    await act(async () => void (await new Promise((r) => setTimeout(r))))
    expect(busy(button)).toBe(false)
    fireEvent.click(button)
    await act(async () => void (await new Promise((r) => setTimeout(r))))
    expect(busy(button)).toBe(false)
  })
})
