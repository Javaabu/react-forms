import * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"

import { Checkbox, Radio } from "../components/checkbox"
import { Form, type InertiaFormLike } from "../components/form"
import { File } from "../components/files"
import { Text } from "../components/inputs"
import { Select2 } from "../components/select"
import { mergeAdapters } from "../core/adapter"
import { FormsProvider } from "../core/provider"
import { html } from "../adapters/html"
import { LinkButton } from "../components/buttons"
import { inertia, inertiaLinks } from "."

type Callbacks = {
  onStart?: () => void
  onProgress?: (p?: { percentage?: number }) => void
  onSuccess?: (page: unknown) => void
  onError?: (errors: Record<string, string>) => void
  onHttpException?: (response: unknown) => void
  onFinish?: () => void
  [key: string]: unknown
}

const page = { props: { errors: {} as Record<string, unknown>, old: undefined as Record<string, unknown> | undefined } }
const visit = vi.fn<(url: string, options: Callbacks & { method: string; data?: FormData }) => void>()

vi.mock("@inertiajs/react", () => ({
  router: { visit: (url: string, options: never) => visit(url, options) },
  usePage: () => page,
  Link: ({ href, children, ...props }: { href: string; children?: React.ReactNode }) => (
    <a href={href} data-inertia-link="" {...props}>
      {children}
    </a>
  ),
}))

beforeEach(() => {
  visit.mockReset()
  page.props = { errors: {}, old: undefined }
})

function withInertia(ui: React.ReactElement) {
  return render(<FormsProvider router={inertia}>{ui}</FormsProvider>)
}

describe("the Inertia router", () => {
  it("visits the action with the form's data, spoofed method and error bag", async () => {
    withInertia(
      <Form action="/users/3" method="PATCH" errorBag="editUser" preserveScroll files>
        <Text name="name" default="ޢަލީ" />
        <File name="avatar" />
        <button type="submit">Save</button>
      </Form>,
    )
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(visit).toHaveBeenCalledTimes(1))
    const [url, options] = visit.mock.calls[0]!
    expect(url).toBe("/users/3")
    expect(options.method).toBe("post")
    expect(options.data!.get("_method")).toBe("PATCH")
    expect(options.data!.get("name")).toBe("ޢަލީ")
    expect(options.errorBag).toBe("editUser")
    expect(options.preserveScroll).toBe(true)
    expect(options.preserveState).toBe("errors")
  })

  it("visits GET forms with the fields in the query", async () => {
    withInertia(
      <Form action="/users" method="GET">
        <Text name="search" default="މާލެ" />
        <button type="submit">Search</button>
      </Form>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Search" }))
    await waitFor(() => expect(visit).toHaveBeenCalled())
    expect(visit.mock.calls[0]![0]).toBe(`/users?search=${encodeURIComponent("މާލެ")}`)
    expect(visit.mock.calls[0]![1].method).toBe("get")
  })

  it("shows processing and progress, and validation errors from the visit", async () => {
    const onProgress = vi.fn()
    withInertia(
      <Form action="/users" onProgress={onProgress}>
        <Text name="email" />
        <button type="submit">Save</button>
      </Form>,
    )
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(visit).toHaveBeenCalled())
    const options = visit.mock.calls[0]![1]
    act(() => options.onStart!())
    expect(document.querySelector("form")).toHaveAttribute("aria-busy", "true")
    act(() => options.onProgress!({ percentage: 40 }))
    expect(onProgress).toHaveBeenCalledWith(40)
    act(() => {
      options.onError!({ email: "The email has already been taken." })
      options.onFinish!()
    })
    expect(document.querySelector("form")).not.toHaveAttribute("aria-busy")
    expect(screen.getAllByText("The email has already been taken.").length).toBeGreaterThan(0)
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus())
  })

  it("calls onSuccess and resets the fields with resetOnSuccess", async () => {
    const onSuccess = vi.fn()
    withInertia(
      <Form action="/messages" onSuccess={onSuccess} resetOnSuccess>
        <Text name="message" />
        <button type="submit">Send</button>
      </Form>,
    )
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "ސަލާމް" } })
    fireEvent.click(screen.getByText("Send"))
    await waitFor(() => expect(visit).toHaveBeenCalled())
    const options = visit.mock.calls[0]![1]
    act(() => {
      options.onSuccess!({ component: "Messages" })
      options.onFinish!()
    })
    expect(onSuccess).toHaveBeenCalledWith({ component: "Messages" })
    expect(screen.getByLabelText("Message")).toHaveValue("")
  })

  it("shows a general message on a server error", async () => {
    withInertia(
      <Form action="/users">
        <button type="submit">Save</button>
      </Form>,
    )
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(visit).toHaveBeenCalled())
    act(() => visit.mock.calls[0]![1].onHttpException!({ status: 500 }))
    expect(await screen.findByText("The form could not be submitted. Please try again.")).toBeInTheDocument()
  })

  it("reads errors (with bags) and old input from the page props", () => {
    page.props = {
      errors: { title: "Required.", createUser: { name: "ނަން ލިޔުއްވާ." } },
      old: { title: "Old title" },
    }
    withInertia(
      <>
        <Form summary={false}>
          <Text name="title" />
        </Form>
        <Form errorBag="createUser" summary={false}>
          <Text name="name" />
        </Form>
      </>,
    )
    expect(screen.getByText("Required.")).toBeInTheDocument()
    expect(screen.getByText("ނަން ލިޔުއްވާ.")).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toHaveValue("Old title")
  })
})

/** A stand-in for Inertia's `useForm()`, with the same shape. */
function useFakeForm<T extends Record<string, unknown>>(initial: T, submit = vi.fn()) {
  const [data, setDataState] = React.useState<T>(initial)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const transform = React.useRef<(d: T) => unknown>((d) => d)
  const form: InertiaFormLike & { data: T } = {
    data,
    errors,
    processing: false,
    progress: null,
    setData: ((keyOrFn: unknown, value?: unknown) => {
      if (typeof keyOrFn === "function") setDataState((d) => (keyOrFn as (d: T) => T)(d))
      else setDataState((d) => ({ ...d, [keyOrFn as string]: value }))
    }) as never,
    submit: ((method: string, url: string, options: Callbacks) =>
      submit(method, url, transform.current(data), options, setErrors)) as never,
    clearErrors: (...fields: string[]) =>
      setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !fields.includes(k)))),
    transform: ((fn: (d: T) => unknown) => (transform.current = fn)) as never,
    reset: vi.fn(),
  }
  return form
}

describe("Inertia's useForm()", () => {
  it("binds the fields to form.data and submits through form.submit", async () => {
    const submit = vi.fn()
    const latest: { data: Record<string, unknown> } = { data: {} }
    function Page() {
      const form = useFakeForm(
        { name: "ޢާއިޝަތު", address: { city: "" }, channels: ["sms"], type: "", tags: [] as string[] },
        submit,
      )
      React.useEffect(() => {
        latest.data = form.data as Record<string, unknown>
      })
      return (
        <Form form={form} action={{ url: "/users", method: "post" }}>
          <Text name="name" />
          <Text name="address[city]" />
          <Checkbox name="channels[]" value="email" label="Email" />
          <Checkbox name="channels[]" value="sms" label="SMS" />
          <Checkbox name="agree" />
          <Radio name="type" value="quiz" label="Quiz" />
          <Radio name="type" value="video" label="Video" />
          <Select2 name="tags" multiple options={{ 1: "Harbour", 2: "Weather" }} />
          <button type="submit">Save</button>
        </Form>
      )
    }
    render(<Page />)
    expect(screen.getByLabelText("Name")).toHaveValue("ޢާއިޝަތު")
    fireEvent.change(screen.getByLabelText("Address City"), { target: { value: "މާލެ" } })
    fireEvent.click(screen.getByLabelText("Email"))
    fireEvent.click(screen.getByLabelText("Agree"))
    fireEvent.click(screen.getByLabelText("Video"))
    await waitFor(() => expect(latest.data.address).toEqual({ city: "މާލެ" }))
    expect(latest.data.channels).toEqual(["sms", "email"])
    expect(latest.data.agree).toBe("1")
    expect(latest.data.type).toBe("video")
    expect(screen.getByLabelText("SMS")).toBeChecked()

    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(submit).toHaveBeenCalled())
    const [method, url, data] = submit.mock.calls[0]!
    expect(method).toBe("post")
    expect(url).toBe("/users")
    expect(data).toMatchObject({ name: "ޢާއިޝަތު", address: { city: "މާލެ" }, agree: "1" })
  })

  it("shows form.errors, clears them on edit, and posts multipart PUTs with _method", async () => {
    const submit = vi.fn()
    function Page() {
      const form = useFakeForm({ email: "" }, submit)
      React.useEffect(() => {
        submit.mockImplementation((_m, _u, _d, _o, setErrors: (e: Record<string, string>) => void) =>
          setErrors({ email: "Taken." }),
        )
      }, [])
      return (
        <Form form={form} action={{ url: "/users/1", method: "put" }} files summary={false}>
          <Text name="email" />
          <button type="submit">Save</button>
        </Form>
      )
    }
    render(<Page />)
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(screen.getByText("Taken.")).toBeInTheDocument())
    const [method, , data, options] = submit.mock.calls[0]!
    expect(method).toBe("post")
    expect(data).toMatchObject({ _method: "put" })
    expect(options.forceFormData).toBe(true)
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.mv" } })
    await waitFor(() => expect(screen.queryByText("Taken.")).not.toBeInTheDocument())
  })
})

describe("inertiaLinks", () => {
  it("renders Inertia's Link for app URLs and plain anchors for others", () => {
    render(
      <FormsProvider ui={mergeAdapters(html, inertiaLinks)}>
        <LinkButton url="/users/create">Create</LinkButton>
        <LinkButton url="https://javaabu.com">External</LinkButton>
      </FormsProvider>,
    )
    expect(screen.getByText("Create").closest("a")).toHaveAttribute("data-inertia-link")
    expect(screen.getByText("External").closest("a")).not.toHaveAttribute("data-inertia-link")
  })
})
