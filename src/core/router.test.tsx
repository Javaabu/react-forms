import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { Form } from "../components/form"
import { Text } from "../components/inputs"
import { FormsProvider } from "./provider"
import { formDataToObject, resolveAction, withFormData, type FormsRouter, type SubmitRequest } from "./router"

/** Wayfinder-generated route functions look like this: callable, with `.url()` and `.form()`. */
const update = Object.assign(
  (args: { id: number } | number) => ({
    url: `/users/${typeof args === "number" ? args : args.id}`,
    method: "put" as const,
  }),
  {
    form: (args: { id: number }) => ({ action: `/users/${args.id}?_method=PUT`, method: "post" as const }),
  },
)
const store = () => ({ url: "/users", method: "post" as const })
const search = () => ({ url: "/users?sort=name", method: "get" as const })

function form(container: HTMLElement) {
  return container.querySelector("form")!
}

describe("resolveAction", () => {
  it("accepts URLs, route objects, form variants and route functions", () => {
    expect(resolveAction("/users")).toEqual({ url: "/users", method: undefined })
    expect(resolveAction(store())).toEqual({ url: "/users", method: "post" })
    expect(resolveAction(update.form({ id: 3 }))).toEqual({ url: "/users/3", method: "put" })
    expect(resolveAction(update, { id: 7, name: "Aishath" })).toEqual({ url: "/users/7", method: "put" })
    expect(resolveAction(store)).toEqual({ url: "/users", method: "post" })
    expect(resolveAction({ url: "/x", method: "HEAD" })).toEqual({ url: "/x", method: "get" })
    expect(resolveAction(undefined)).toEqual({ url: undefined, method: undefined })
  })

  it("keeps other query parameters of a form variant", () => {
    expect(resolveAction({ action: "/users/1?_method=PATCH&tab=2", method: "post" })).toEqual({
      url: "/users/1?tab=2",
      method: "patch",
    })
  })
})

describe("Form with Wayfinder routes", () => {
  it("posts to a route object with its method spoofed", () => {
    const { container } = render(
      <FormsProvider csrfToken="t0ken">
        <Form action={update({ id: 5 })} />
      </FormsProvider>,
    )
    expect(form(container)).toHaveAttribute("action", "/users/5")
    expect(form(container)).toHaveAttribute("method", "POST")
    const data = new FormData(form(container))
    expect(data.get("_method")).toBe("PUT")
    expect(data.get("_token")).toBe("t0ken")
  })

  it("calls a route function with the bound model", () => {
    const { container } = render(<Form model={{ id: 9, name: "Ibrahim" }} action={update} />)
    expect(form(container)).toHaveAttribute("action", "/users/9")
    expect(new FormData(form(container)).get("_method")).toBe("PUT")
  })

  it("lets method win over the route's method", () => {
    const { container } = render(<Form action={update({ id: 1 })} method="patch" />)
    expect(new FormData(form(container)).get("_method")).toBe("PATCH")
  })

  it("submits GET routes without _token or _method", () => {
    const { container } = render(
      <FormsProvider csrfToken="t0ken">
        <Form action={search()} />
      </FormsProvider>,
    )
    expect(form(container)).toHaveAttribute("method", "GET")
    expect(new FormData(form(container)).has("_token")).toBe(false)
    expect(new FormData(form(container)).has("_method")).toBe(false)
  })

  it("passes the route's URL and real method to the router", async () => {
    const submit = vi.fn<FormsRouter["submit"]>()
    render(
      <FormsProvider router={{ name: "test", submit }}>
        <Form action={update({ id: 4 })} errorBag="editUser" preserveScroll>
          <Text name="name" default="ޢާއިޝަތު" />
          <button type="submit">Save</button>
        </Form>
      </FormsProvider>,
    )
    fireEvent.click(screen.getByText("Save"))
    await waitFor(() => expect(submit).toHaveBeenCalled())
    const request = submit.mock.calls[0]![0] as SubmitRequest
    expect(request.url).toBe("/users/4")
    expect(request.method).toBe("put")
    expect(request.errorBag).toBe("editUser")
    expect(request.options.preserveScroll).toBe(true)
    expect(request.data.get("name")).toBe("ޢާއިޝަތު")
    expect(request.data.get("_method")).toBe("PUT")
  })
})

describe("FormData helpers", () => {
  it("turn FormData into an object, repeated names into arrays", () => {
    const data = new FormData()
    data.append("name", "Ali")
    data.append("tags[]", "1")
    data.append("tags[]", "2")
    expect(formDataToObject(data)).toEqual({ name: "Ali", "tags[]": ["1", "2"] })
  })

  it("append FormData to a URL for GET", () => {
    const data = new FormData()
    data.append("search", "މާލެ")
    expect(withFormData("/users?page=2", data)).toBe(`/users?page=2&search=${encodeURIComponent("މާލެ")}`)
    expect(withFormData("/users", new FormData())).toBe("/users")
  })
})
