import { act, screen, waitFor } from "@testing-library/react"

import * as Browser from "./browser"

// The entry behind dist/forms.iife.js (window.JavaabuForms). scripts/check-browser-build.mjs runs the built file.
describe("the <script> tag entry", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    act(() => Browser.i18n.setLocale("en"))
  })

  it("exposes the components, the HTML adapter, React and i18n", () => {
    expect(Browser.Form).toBeTypeOf("function")
    expect(Browser.Text).toBeTypeOf("function")
    expect(Browser.html).toBeTypeOf("object")
    expect(Browser.React.createElement).toBe(Browser.h)
    expect(Browser.i18n.setLocale).toBeTypeOf("function")
  })

  it("mounts a form into a selector, with provider options", async () => {
    document.body.innerHTML = '<div id="app"></div>'
    const { h, mount, Form, Text } = Browser

    let root: ReturnType<typeof mount> | undefined
    act(() => {
      root = mount("#app", h(Form, { action: "/users" }, h(Text, { name: "name", label: "ނަން" })), {
        errors: { name: "ނަން ލިޔުއްވާ." },
      })
    })

    expect(await screen.findByLabelText(/ނަން/)).toHaveAttribute("name", "name")
    expect(screen.getByText("ނަން ލިޔުއްވާ.")).toBeInTheDocument()

    act(() => root!.unmount())
    await waitFor(() => expect(document.getElementById("app")).toBeEmptyDOMElement())
  })

  it("mounts into an element", async () => {
    const target = document.createElement("div")
    document.body.append(target)
    act(() => {
      Browser.mount(target, Browser.h(Browser.Submit, null, "ފޮނުވާ"))
    })
    expect(await screen.findByRole("button", { name: "ފޮނުވާ" })).toBeInTheDocument()
  })

  it("says which selector matched nothing", () => {
    expect(() => Browser.mount("#missing", null)).toThrow('JavaabuForms.mount: no element matches "#missing".')
  })
})
