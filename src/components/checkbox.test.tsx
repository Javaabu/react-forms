import { act, render } from "@testing-library/react"

import { fakeUseForm } from "../../test/helpers"
import { Checkbox, Radio } from "./checkbox"
import { Form } from "./form"

function renderWithUseForm(initial: Record<string, unknown>, children: React.ReactNode, model?: unknown) {
  const fake = fakeUseForm(initial)
  function Page() {
    const form = fake.useFake()
    return (
      <Form form={form as never} action="/x" model={model}>
        {children}
      </Form>
    )
  }
  render(<Page />)
  return fake.latest
}

describe("choices in a useForm() store", () => {
  it("keeps the store's radio value over a default", async () => {
    const latest = renderWithUseForm(
      { plan: "pro" },
      <>
        <Radio name="plan" value="free" label="ހިލޭ" default />
        <Radio name="plan" value="pro" label="ޕްރޯ" />
      </>,
    )
    await act(async () => {})
    expect(latest.data.plan).toBe("pro")
  })

  it("keeps the store's checkbox group over the model", async () => {
    const latest = renderWithUseForm(
      { channels: ["sms"] },
      <>
        <Checkbox name="channels[]" value="email" label="އީމެއިލް" />
        <Checkbox name="channels[]" value="sms" label="އެސްއެމްއެސް" />
      </>,
      { channels: ["email"] },
    )
    await act(async () => {})
    expect(latest.data.channels).toEqual(["sms"])
  })

  it("still seeds a store that doesn't have the field", async () => {
    const latest = renderWithUseForm(
      { channels: null },
      <>
        <Checkbox name="channels[]" value="email" label="އީމެއިލް" default />
        <Checkbox name="channels[]" value="sms" label="އެސްއެމްއެސް" default />
        <Radio name="plan" value="free" label="ހިލޭ" default />
        <Radio name="plan" value="pro" label="ޕްރޯ" />
      </>,
    )
    await act(async () => {})
    expect(latest.data.channels).toEqual(["email", "sms"])
    expect(latest.data.plan).toBe("free")
  })
})
