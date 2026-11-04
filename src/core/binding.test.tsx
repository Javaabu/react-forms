import { fireEvent, render, screen } from "@testing-library/react"

import { Checkbox, Radio } from "../components/checkbox"
import { Date as DateField, Datetime } from "../components/dates"
import { Form } from "../components/form"
import { Hidden, Number as NumberField, Text } from "../components/inputs"
import { Select, Select2 } from "../components/select"
import { Textarea } from "../components/textarea"
import { Model, OldInput } from "./binding"
import { FormsProvider } from "./provider"

function values(container: HTMLElement) {
  return new FormData(container.querySelector("form")!)
}

const value = (label: string | RegExp) => (screen.getByLabelText(label) as HTMLInputElement).value

describe("value precedence: old input → bound value → default", () => {
  it("reads each field from the right source", () => {
    render(
      <Form model={{ name: "From model", city: null }} old={{ email: "old@example.com" }}>
        <Text name="name" default="Default" />
        <Text name="city" default="Default city" />
        <Text name="email" model={{ email: "model@example.com" }} />
        <Text name="nested[value]" model={{ nested: { value: "deep" } }} />
        <Text name="unbound" model={false} default="Fallback" />
      </Form>,
    )
    expect(value("Name")).toBe("From model")
    expect(value("City")).toBe("Default city")
    expect(value("Email")).toBe("old@example.com")
    expect(value("Nested Value")).toBe("deep")
    expect(value("Unbound")).toBe("Fallback")
  })

  it("uses old input even when it is null (the key was submitted)", () => {
    render(
      <Form model={{ title: "ބޮޑު ސުރުޚީ" }} old={{ title: null }}>
        <Text name="title" />
      </Form>,
    )
    expect(value("Title")).toBe("")
  })

  it("reads bracket names as nested paths: address[city] → address.city", () => {
    const { container } = render(
      <Form model={{ address: { city: "މާލެ" }, items: [{ name: "ފޮތް" }] }}>
        <Text name="address[city]" />
        <Text name="items[0][name]" />
      </Form>,
    )
    expect(value("Address City")).toBe("މާލެ")
    expect(values(container).get("items[0][name]")).toBe("ފޮތް")
    expect(screen.getByLabelText("Address City")).toHaveAttribute("id", "address-city")
  })

  it("lets old input from the provider apply to every form, and a form's old prop win", () => {
    render(
      <FormsProvider old={{ title: "From provider", body: "Provider body" }}>
        <Form>
          <Text name="title" />
        </Form>
        <Form old={{ body: "From form" }}>
          <Textarea name="body" />
        </Form>
      </FormsProvider>,
    )
    expect(value("Title")).toBe("From provider")
    expect(value("Body")).toBe("From form")
  })

  it("binds nested models with Model, and a field's model prop wins", () => {
    render(
      <Form model={{ name: "Ali", profile: { bio: "Hello" } }}>
        <Model model={{ bio: "From profile" }}>
          <Textarea name="bio" />
        </Model>
        <Text name="name" />
        <OldInput old={{}}>
          <Text name="role" model={{ role: "Editor" }} />
        </OldInput>
      </Form>,
    )
    expect(value("Bio")).toBe("From profile")
    expect(value("Name")).toBe("Ali")
    expect(value("Role")).toBe("Editor")
  })

  it("prints booleans and numbers like Blade's {{ }}", () => {
    const { container } = render(
      <Form model={{ active: true, archived: false, count: 0 }}>
        <Hidden name="active" />
        <Hidden name="archived" />
        <NumberField name="count" />
      </Form>,
    )
    expect(values(container).get("active")).toBe("1")
    expect(values(container).get("archived")).toBe("")
    expect(values(container).get("count")).toBe("0")
  })

  it("follows the model when it changes after the first render", () => {
    const { rerender } = render(
      <Form model={{ title: "" }}>
        <Text name="title" />
      </Form>,
    )
    rerender(
      <Form model={{ title: "Loaded" }}>
        <Text name="title" />
      </Form>,
    )
    expect(value("Title")).toBe("Loaded")
  })

  it("keeps a controlled value over everything", () => {
    render(
      <Form model={{ title: "Model" }} old={{ title: "Old" }}>
        <Text name="title" value="Controlled" onChange={() => {}} />
      </Form>,
    )
    expect(value("Title")).toBe("Controlled")
  })
})

describe("checkboxes and radios", () => {
  it("are checked from a boolean, an array of values or the default", () => {
    const { container } = render(
      <Form model={{ is_featured: true, channels: ["sms"], notify: null }}>
        <Checkbox name="is_featured" />
        <Checkbox name="channels[]" value="email" label="Email" />
        <Checkbox name="channels[]" value="sms" label="SMS" />
        <Checkbox name="notify" default />
        <Checkbox name="hidden_flag" model={false} />
      </Form>,
    )
    const data = values(container)
    expect(data.get("is_featured")).toBe("1")
    expect(data.getAll("channels[]")).toEqual(["sms"])
    expect(data.get("notify")).toBe("1")
    expect(data.get("hidden_flag")).toBeNull()
  })

  it("follow old input only, once there is any (an unchecked box isn't submitted)", () => {
    const { container } = render(
      <Form model={{ is_featured: true, channels: ["sms"] }} old={{ title: "x", channels: ["email"] }}>
        <Checkbox name="is_featured" />
        <Checkbox name="channels[]" value="email" label="Email" />
        <Checkbox name="channels[]" value="sms" label="SMS" />
      </Form>,
    )
    const data = values(container)
    expect(data.get("is_featured")).toBeNull()
    expect(data.getAll("channels[]")).toEqual(["email"])
  })

  it("give grouped checkboxes unique ids", () => {
    render(
      <Form>
        <Checkbox name="channels[]" value="email" label="Email" />
        <Checkbox name="channels[]" value="sms" label="SMS" />
      </Form>,
    )
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "channels-email")
    expect(screen.getByLabelText("SMS")).toHaveAttribute("id", "channels-sms")
  })

  it("select the radio whose value is bound, and move the selection on click", () => {
    const { container } = render(
      <Form model={{ type: "video" }}>
        <Radio name="type" value="quiz" label="Quiz" />
        <Radio name="type" value="video" label="Video" />
      </Form>,
    )
    expect(values(container).get("type")).toBe("video")
    fireEvent.click(screen.getByLabelText("Quiz"))
    expect(values(container).get("type")).toBe("quiz")
    expect(screen.getByLabelText("Video")).not.toBeChecked()
  })
})

describe("selects", () => {
  it("prefer default over the bound value, as Blade's Select does", () => {
    const { container } = render(
      <Form model={{ status: "draft" }}>
        <Select name="status" default="published" options={{ draft: "Draft", published: "Published" }} />
      </Form>,
    )
    expect(values(container).get("status")).toBe("published")
  })

  it("read relations: a model becomes its key, a collection its keys", () => {
    const { container } = render(
      <Form model={{ category: { id: 2, name: "News" }, tags: [{ id: 1 }, { id: 3 }] }}>
        <Select2
          name="category"
          relation
          options={[
            { id: 1, name: "Events" },
            { id: 2, name: "News" },
          ]}
        />
        <Select2 name="tags[]" relation multiple options={{ 1: "Harbour", 2: "Weather", 3: "Transport" }} />
      </Form>,
    )
    const data = values(container)
    expect(data.get("category")).toBe("2")
    expect(data.getAll("tags[]")).toEqual(["1", "3"])
    expect(data.get("sync_tags")).toBe("1")
  })

  it("use old input for multiple values", () => {
    const { container } = render(
      <Form model={{ tags: ["1"] }} old={{ tags: ["2", "3"] }}>
        <Select2 name="tags[]" multiple options={{ 1: "Harbour", 2: "Weather", 3: "Transport" }} />
      </Form>,
    )
    expect(values(container).getAll("tags[]")).toEqual(["2", "3"])
  })
})

describe("dates", () => {
  it("submit Laravel's formats whatever the bound value's format", () => {
    const { container } = render(
      <Form model={{ published_on: "2026-11-04", starts_at: "2026-11-04 09:30:00" }}>
        <DateField name="published_on" />
        <Datetime name="starts_at" />
      </Form>,
    )
    expect(values(container).get("published_on")).toBe("2026-11-04")
    expect(values(container).get("starts_at")).toBe("2026-11-04 09:30:00")
  })
})
