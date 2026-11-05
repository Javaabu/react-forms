import { act, fireEvent, render, screen } from "@testing-library/react"
import { setLocale } from "@javaabu/i18n"

import { Tel, Text } from "../components/inputs"
import { Textarea } from "../components/textarea"
import { Pagination } from "../components/listing"
import { Form } from "../components/form"
import { THAANA_KEYMAP, thaanaKeyDown, toThaana } from "./thaana"
import { dv } from "./locales"

afterEach(() => act(() => setLocale("en")))

describe("Thaana typing", () => {
  it("maps the phonetic layout", () => {
    expect(toThaana("dhivehi")).toBe("ދހިވެހި")
    expect(toThaana("rAjje")).toBe("ރާޖޖެ")
    expect(THAANA_KEYMAP.a).toBe("ަ")
    expect(THAANA_KEYMAP["?"]).toBe("؟")
  })

  it("types Thaana into thaana fields, at the caret, and reports the change", () => {
    const { container } = render(
      <Form>
        <Text name="name_dv" thaana />
        <Textarea name="note" thaana />
        <Text name="email_ascii" />
      </Form>,
    )
    const input = screen.getByLabelText("Name Dv") as HTMLInputElement
    expect(input).toHaveAttribute("dir", "rtl")
    expect(input).toHaveAttribute("lang", "dv")
    for (const key of "mlk") fireEvent.keyDown(input, { key })
    expect(input.value).toBe("މލކ")
    expect(new FormData(container.querySelector("form")!).get("name_dv")).toBe("މލކ")

    const note = screen.getByLabelText("Note") as HTMLTextAreaElement
    fireEvent.keyDown(note, { key: "s" })
    expect(note.value).toBe("ސ")

    const plain = screen.getByLabelText("Email Ascii") as HTMLInputElement
    fireEvent.keyDown(plain, { key: "s" })
    expect(plain.value).toBe("")
  })

  it("leaves shortcuts alone", () => {
    render(<Text name="title" thaana />)
    const input = screen.getByLabelText("Title") as HTMLInputElement
    fireEvent.keyDown(input, { key: "c", ctrlKey: true })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(input.value).toBe("")
  })

  it("keeps email, URL and phone fields left-to-right without Thaana", () => {
    render(<Tel name="phone" {...{ thaana: true }} />)
    const input = screen.getByLabelText("Phone")
    expect(input).toHaveAttribute("dir", "ltr")
    fireEvent.keyDown(input, { key: "s" })
    expect((input as HTMLInputElement).value).toBe("")
  })

  it("is a plain keydown handler adapters can use", () => {
    const input = document.createElement("input")
    document.body.appendChild(input)
    const event = { key: "k", currentTarget: input, defaultPrevented: false, preventDefault: vi.fn() }
    thaanaKeyDown(event as never)
    expect(input.value).toBe("ކ")
    expect(event.preventDefault).toHaveBeenCalled()
    input.remove()
  })
})

describe("RTL", () => {
  it("flips side arrows and uses Dhivehi lines in Dhivehi", () => {
    act(() => setLocale("dv"))
    const { container } = render(
      <Pagination paginator={{ current_page: 2, last_page: 3, per_page: 10 }} getPageHref={(p) => `?page=${p}`} />,
    )
    expect(screen.getByRole("navigation")).toHaveAccessibleName(dv.pagination)
    expect(container.querySelector('[data-icon="chevron-left"]')).toHaveAttribute("data-flipped", "true")
  })

  it("doesn't flip in left-to-right locales", () => {
    const { container } = render(
      <Pagination paginator={{ current_page: 2, last_page: 3, per_page: 10 }} getPageHref={(p) => `?page=${p}`} />,
    )
    expect(container.querySelector('[data-icon="chevron-left"]')).not.toHaveAttribute("data-flipped")
  })
})
