import * as React from "react"
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

describe("resetOnSuccess", () => {
  it("leaves fields it doesn't list alone after it changes from true to a list", async () => {
    function Page() {
      const [names, setNames] = React.useState<boolean | string[]>(true)
      return (
        <Form action="/x" resetOnSuccess={names} onSubmit={async () => {}} onSuccess={() => setNames(["a"])}>
          <Text name="a" default="" />
          <Text name="b" default="" />
          <button type="submit">go</button>
        </Form>
      )
    }
    render(<Page />)
    const submit = async () => {
      fireEvent.click(screen.getByText("go"))
      await act(async () => {})
    }
    fireEvent.change(screen.getByLabelText("B"), { target: { value: "ފުރަތަމަ" } })
    await submit()
    expect(screen.getByLabelText("B")).toHaveValue("")
    fireEvent.change(screen.getByLabelText("A"), { target: { value: "a" } })
    fireEvent.change(screen.getByLabelText("B"), { target: { value: "ދެވަނަ" } })
    await submit()
    expect(screen.getByLabelText("A")).toHaveValue("")
    expect(screen.getByLabelText("B")).toHaveValue("ދެވަނަ")
  })
})
