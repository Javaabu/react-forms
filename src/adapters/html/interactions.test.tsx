import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"

import { Accordion, Alert, Card, Modal, NavTabs, Status, Tabs, TabsPane, TextEntry } from "../../components/display"
import { Form } from "../../components/form"
import { FileUpload, Image } from "../../components/files"
import { Number as NumberField, Text, Url } from "../../components/inputs"
import { MapInput } from "../../components/map-input"
import { Select2 } from "../../components/select"
import { Time } from "../../components/dates"
import { Wysiwyg } from "../../components/wysiwyg"
import { Icon } from "../../components/icon"
import { LinkButton, Submit } from "../../components/buttons"
import { FormsProvider } from "../../core/provider"
import { pageWindow } from "."

function data(container: HTMLElement) {
  return new FormData(container.querySelector("form")!)
}

afterEach(() => vi.unstubAllGlobals())

describe("HTML adapter widgets", () => {
  it("dismisses alerts and shows cards, statuses and entries", () => {
    render(
      <>
        <Alert type="danger" heading="ގޯސް" dismissible icon="fa-solid fa-xmark">
          Something failed.
        </Alert>
        <Card title="ކާޑު" subtitle="Sub" footer="Foot" imageTop={<img alt="top" />}>
          Body
        </Card>
        <Status color="warning">Pending</Status>
        <TextEntry name="bio" value={"Line one\nLine two"} multiline inline />
      </>,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Something failed.")
    fireEvent.click(screen.getByLabelText("Close"))
    expect(screen.queryByText("Something failed.")).not.toBeInTheDocument()
    expect(screen.getByText("Foot")).toHaveAttribute("data-slot", "card-footer")
    expect(screen.getByText("Pending")).toHaveAttribute("data-tone", "warning")
    expect(screen.getByText("Bio")).toBeInTheDocument()
  })

  it("switches tabs and opens accordion items", () => {
    const onValueChange = vi.fn()
    render(
      <>
        <Tabs tabs={[{ name: "home" }, { name: "profile", title: "ޕްރޮފައިލް" }]} onValueChange={onValueChange}>
          <TabsPane name="home">Home pane</TabsPane>
          <TabsPane name="profile">Profile pane</TabsPane>
        </Tabs>
        <Accordion
          id="faq"
          items={[
            { title: "One", content: "First" },
            { title: "Two", content: "Second", show: true },
          ]}
        />
        <NavTabs
          tabs={[
            { title: "Details", url: "/a", active: true },
            { title: "Roles", url: "/b", disabled: true },
          ]}
        />
      </>,
    )
    expect(screen.getByText("Profile pane").closest("[role=tabpanel]")).toHaveAttribute("hidden")
    fireEvent.click(screen.getByRole("tab", { name: "ޕްރޮފައިލް" }))
    expect(onValueChange).toHaveBeenCalledWith("profile")
    expect(screen.getByText("Profile pane").closest("[role=tabpanel]")).not.toHaveAttribute("hidden")
    const one = screen.getByText("One").closest("details")!
    one.open = true
    fireEvent(one, new Event("toggle"))
    expect(screen.getByText("Second").closest("details")).not.toHaveAttribute("open")
    expect(screen.getByText("Details")).toHaveAttribute("aria-current", "page")
    expect(screen.getByText("Roles")).toHaveAttribute("aria-disabled", "true")
  })

  it("opens a modal from its trigger and closes it", () => {
    const onOpenChange = vi.fn()
    render(
      <Modal
        title="ސުރުޚީ"
        trigger={<button type="button">Open</button>}
        onOpenChange={onOpenChange}
        modalSizeClass="modal-xl"
      >
        Modal body
      </Modal>,
    )
    fireEvent.click(screen.getByText("Open"))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(document.querySelector("dialog")).toHaveAttribute("data-size", "xl")
    fireEvent.click(screen.getByLabelText("Close"))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("types numbers, times, URLs and HTML", () => {
    const { container } = render(
      <Form>
        <NumberField name="price" decimals={2} />
        <Time name="opens_at" />
        <Url name="website" />
        <Wysiwyg name="content" />
        <Text name="code" prepend="MV" append=".mv" />
      </Form>,
    )
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "12.345" } })
    fireEvent.change(screen.getByLabelText("Opens At"), { target: { value: "08:30" } })
    fireEvent.change(screen.getByLabelText("Website"), { target: { value: "javaabu.com" } })
    fireEvent.blur(screen.getByLabelText("Website"))
    fireEvent.change(screen.getByLabelText("Content"), { target: { value: "<p>ހެލޯ</p>" } })
    const form = data(container)
    expect(form.get("price")).toBe("12.345")
    expect(form.get("opens_at")).toBe("08:30")
    expect(form.get("website")).toBe("https://javaabu.com")
    expect(form.get("content")).toBe("<p>ހެލޯ</p>")
    expect(screen.getByText("MV")).toHaveAttribute("data-slot", "input-prepend")
  })

  it("searches, creates tags and searches the server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        expect(url).toContain("filter%5Bsearch%5D=ma")
        return new Response(JSON.stringify({ data: [{ id: 7, name: "މާލެ" }] }), {
          headers: { "content-type": "application/json" },
        })
      }),
    )
    const { container } = render(
      <Form>
        <Select2 name="tags" multiple tags options={{ 1: "Harbour" }} />
        <Select2 name="city" isAjax ajaxUrl="/api/cities" />
      </Form>,
    )
    const [tagSearch, citySearch] = screen.getAllByLabelText("Search")
    fireEvent.change(tagSearch!, { target: { value: "ބަނދަރު" } })
    fireEvent.keyDown(tagSearch!, { key: "Enter" })
    expect(data(container).getAll("tags[]")).toEqual(["ބަނދަރު"])
    fireEvent.change(citySearch!, { target: { value: "ma" } })
    expect(await screen.findByRole("option", { name: "މާލެ" }, { timeout: 2000 })).toBeInTheDocument()
  })

  it("windows long page lists", () => {
    expect(pageWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10])
    expect(pageWindow(1, 3)).toEqual([1, 2, 3])
  })
})

describe("icons", () => {
  it("draws Blade's bundled icons on buttons, the aliases and icon font classes", () => {
    render(
      <>
        <LinkButton url="/roles/1/edit" startIcon="pencil">
          ބަދަލުކުރޭ
        </LinkButton>
        <Submit color="danger" startIcon="trash-2" endIcon="chevron-right">
          ފޮހެލާ
        </Submit>
        <Icon name="close" />
        <Icon name="fa-solid fa-mosque" className="text-primary" />
      </>,
    )
    const icons = [...document.querySelectorAll("[data-slot=icon]")]
    expect(icons.map((icon) => icon.getAttribute("data-icon"))).toEqual([
      "pencil",
      "trash-2",
      "chevron-right",
      "x",
      "fa-solid fa-mosque",
    ])
    expect(icons[0]!.querySelector("path")).toHaveAttribute("d")
    expect(icons[4]!.tagName).toBe("I")
    expect(icons[4]).toHaveClass("fa-solid", "fa-mosque", "text-primary")
    for (const icon of icons) expect(icon).toHaveAttribute("aria-hidden", "true")
  })
})

describe("MapInput", () => {
  it("submits the bound point and lets the coordinates be typed", () => {
    const { container } = render(
      <FormsProvider settings={{ default_lat: 4.17, default_lng: 73.5 }}>
        <Form model={{ lat: 4.1755, lng: 73.5093 }}>
          <MapInput name="location" />
        </Form>
      </FormsProvider>,
    )
    expect(data(container).get("lat")).toBe("4.1755")
    fireEvent.change(screen.getByLabelText("Longitude"), { target: { value: "73.51" } })
    expect(data(container).get("lng")).toBe("73.51")
  })

  it("submits a radius in its unit and a polygon as WKT", () => {
    const { container } = render(
      <Form
        model={{
          lat: 4.17,
          lng: 73.5,
          radius: 2,
          boundary: "POLYGON((73.5 4.17, 73.6 4.17, 73.6 4.2, 73.5 4.17))",
        }}
      >
        <MapInput name="area" enableRadius radiusUnit="km" hideInputs />
        <MapInput name="zone" enablePolygon latName="zone_lat" lngName="zone_lng" />
      </Form>,
    )
    const form = data(container)
    expect(form.get("radius")).toBe("2")
    expect(form.get("lat")).toBe("4.17")
    expect(String(form.get("boundary"))).toMatch(/^POLYGON\(\(73\.5 4\.17/)
  })
})

describe("file uploads", () => {
  it("uploads a picked file to the form's action and reports the response", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } }),
    )
    vi.stubGlobal("fetch", fetchMock)
    const onUploaded = vi.fn()
    render(
      <FormsProvider csrfToken="t0ken">
        <Form action="/users/1/avatar" method="PATCH" files>
          <FileUpload name="avatar" type="image" onUploaded={onUploaded} />
        </Form>
      </FormsProvider>,
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).not.toHaveAttribute("name")
    const file = new File(["x"], "ފޮޓޯ.png", { type: "image/png" })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith({ ok: true }))
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("/users/1/avatar")
    const body = init.body as FormData
    expect(body.get("_method")).toBe("PATCH")
    expect(body.get("_token")).toBe("t0ken")
    expect((body.get("avatar") as File).name).toBe("ފޮޓޯ.png")
  })

  it("shows upload validation errors under the field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify({ message: "x", errors: { avatar: ["Too big."] } }), { status: 422 }),
      ),
    )
    render(
      <Form action="/users/1/avatar" files>
        <FileUpload name="avatar" onUploaded={() => {}} />
      </Form>,
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(["x"], "a.pdf")] } })
    expect(await screen.findByText("Too big.")).toBeInTheDocument()
  })

  it("previews and removes a picked image", () => {
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: () => "blob:preview", revokeObjectURL: () => {} }))
    render(
      <Form files>
        <Image name="cover" circle />
      </Form>,
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { files: [new File(["x"], "c.png", { type: "image/png" })] } })
    })
    expect(screen.getByRole("img")).toHaveAttribute("src", "blob:preview")
    fireEvent.click(screen.getByText("Remove"))
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})
