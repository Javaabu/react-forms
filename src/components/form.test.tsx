import { act, fireEvent, render, screen } from "@testing-library/react"

import { fakeUseForm } from "../../test/helpers"
import { Form } from "./form"
import { Text } from "./inputs"

describe("Form with useForm()", () => {
  function renderPage(props: Record<string, unknown> = {}) {
    const fake = fakeUseForm({ name: "ޢަލީ" })
    function Page() {
      const form = fake.useFake()
      return (
        <Form form={form as never} action="/x" {...props}>
          <Text name="name" />
          <button type="submit">go</button>
        </Form>
      )
    }
    render(<Page />)
    return fake.calls
  }

  it("leaves the page's own transform alone", () => {
    const calls = renderPage()
    fireEvent.click(screen.getByText("go"))
    expect(calls.submit.length).toBe(1)
    expect(calls.transform.length).toBe(0)
  })

  it("leaves it alone for a PUT without files, which Inertia sends as is", () => {
    const calls = renderPage({ method: "put" })
    fireEvent.click(screen.getByText("go"))
    expect(calls.submit[0]![0]).toBe("put")
    expect(calls.transform.length).toBe(0)
  })

  it("adds _method through transform for a multipart PUT", async () => {
    const calls = renderPage({ method: "put", files: true })
    fireEvent.click(screen.getByText("go"))
    await act(async () => {})
    expect(calls.submit[0]![0]).toBe("post")
    expect(calls.transform.length).toBe(1)
    const transform = calls.transform[0] as (d: Record<string, unknown>) => Record<string, unknown>
    expect(transform({ name: "ޢަލީ" })).toEqual({ name: "ޢަލީ", _method: "put" })
  })
})
