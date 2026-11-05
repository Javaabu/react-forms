import * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"

// Only the package root, as another package (block-editor, mediapicker, …) would import it.
import {
  ConditionalWrapper,
  Form,
  FormsProvider,
  splitFieldProps,
  useField,
  useFieldState,
  useFieldValue,
  usePublishField,
  type FieldProps,
  type FormsRouter,
  type InertiaFormLike,
  type SubmitCallbacks,
} from "../index"

interface ColourFieldProps extends FieldProps {
  onChange?: (colour: string) => void
}

/** A custom field without a native input: swatch buttons and a hidden input. */
function ColourField(props: ColourFieldProps) {
  const { field, rest } = splitFieldProps(props)
  const f = useField(field)
  const initial = String(useFieldValue(field.name, field.model, field.default) ?? "")
  const [colour, setColour] = useFieldState(field.name, initial)
  usePublishField({
    id: f.id,
    name: field.name,
    kind: "value",
    value: colour,
    disabled: f.disabled,
    label: f.labelText,
  })

  return f.wrap(
    <div
      role="group"
      id={f.id}
      aria-labelledby={`${f.baseId}-label`}
      aria-describedby={f.describedBy}
      aria-invalid={f.invalid || undefined}
    >
      {["ރަތް", "ނޫ"].map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={colour === option}
          disabled={f.disabled}
          onClick={() => {
            setColour(option)
            rest.onChange?.(option)
          }}
        >
          {option}
        </button>
      ))}
      <input type="hidden" name={field.name} value={colour} disabled={f.disabled} />
    </div>,
  )
}

function submitted(container: HTMLElement) {
  return new FormData(container.querySelector("form")!)
}

describe("custom fields built with the exported hooks", () => {
  it("binds the model, submits natively and passes the rest of the props on", () => {
    const onChange = vi.fn()
    const { container } = render(
      <Form model={{ colour: "ރަތް" }}>
        <ColourField name="colour" label="ކުލަ" help="Pick one." onChange={onChange} />
      </Form>,
    )
    expect(screen.getByRole("group", { name: "ކުލަ" })).toHaveAccessibleDescription("Pick one.")
    expect(submitted(container).get("colour")).toBe("ރަތް")
    fireEvent.click(screen.getByText("ނޫ"))
    expect(submitted(container).get("colour")).toBe("ނޫ")
    expect(onChange).toHaveBeenCalledWith("ނޫ")
  })

  it("shows its errors and clears them when edited", () => {
    render(
      <Form errors={{ colour: "ކުލައެއް ޚިޔާރު ކުރައްވާ." }} summary={false}>
        <ColourField name="colour" />
      </Form>,
    )
    expect(screen.getByRole("group")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("ކުލައެއް ޚިޔާރު ކުރައްވާ.")).toBeInTheDocument()
    fireEvent.click(screen.getByText("ރަތް"))
    expect(screen.queryByText("ކުލައެއް ޚިޔާރު ކުރައްވާ.")).not.toBeInTheDocument()
  })

  it("is seen by ConditionalWrapper", async () => {
    render(
      <Form>
        <ColourField name="colour" />
        <ConditionalWrapper enableElem="#colour" enableValue="ނޫ" hideFields>
          <span>Shade</span>
        </ConditionalWrapper>
      </Form>,
    )
    const section = document.querySelector("[data-slot=conditional-wrapper]")!
    expect(section).toHaveAttribute("data-state", "hidden")
    fireEvent.click(screen.getByText("ނޫ"))
    await waitFor(() => expect(section).toHaveAttribute("data-state", "enabled"))
  })

  it("returns to its starting value with resetOnSuccess", async () => {
    let callbacks: SubmitCallbacks | undefined
    const router: FormsRouter = { name: "test", submit: (_request, cb) => (callbacks = cb) }
    const { container } = render(
      <FormsProvider router={router}>
        <Form action="/colours" resetOnSuccess>
          <ColourField name="colour" default="ރަތް" />
          <button type="submit">Save</button>
        </Form>
      </FormsProvider>,
    )
    fireEvent.click(screen.getByText("ނޫ"))
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(callbacks).toBeDefined())
    act(() => {
      callbacks!.onSuccess()
      callbacks!.onFinish()
    })
    expect(submitted(container).get("colour")).toBe("ރަތް")
  })

  it("reads and writes Inertia's useForm() data", async () => {
    const latest: { data: Record<string, unknown> } = { data: {} }
    function Page() {
      const [data, setData] = React.useState<Record<string, unknown>>({ colour: "ނޫ" })
      React.useEffect(() => {
        latest.data = data
      })
      const form: InertiaFormLike = {
        data,
        errors: {},
        processing: false,
        progress: null,
        // Inertia's setData(key, value) and setData(data => …); the field uses the second.
        setData: ((keyOrFn: unknown, value?: unknown) =>
          typeof keyOrFn === "function"
            ? setData(keyOrFn as (d: Record<string, unknown>) => Record<string, unknown>)
            : setData((d) => ({ ...d, [keyOrFn as string]: value }))) as never,
        submit: vi.fn() as never,
        clearErrors: () => {},
        transform: (() => {}) as never,
        reset: vi.fn(),
      }
      return (
        <Form form={form} action={{ url: "/colours", method: "post" }}>
          <ColourField name="colour" />
        </Form>
      )
    }
    render(<Page />)
    expect(screen.getByText("ނޫ")).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(screen.getByText("ރަތް"))
    await waitFor(() => expect(latest.data.colour).toBe("ރަތް"))
    expect(screen.getByText("ރަތް")).toHaveAttribute("aria-pressed", "true")
  })
})
