import { act, render, screen } from "@testing-library/react"
import { addLines, setLocale } from "@javaabu/i18n"

import { Select2 } from "../components/select"
import { Text } from "../components/inputs"
import { FormsProvider } from "./provider"
import { bundledLine, useFormsTranslation } from "./strings"
import { dv, en } from "./locales"

function Line({
  k,
  replace,
}: {
  k: Parameters<ReturnType<typeof useFormsTranslation>["t"]>[0]
  replace?: Record<string, string | number>
}) {
  const { t } = useFormsTranslation()
  return <span data-testid="line">{t(k, replace)}</span>
}

afterEach(() => act(() => setLocale("en")))

describe("package strings", () => {
  it("has a Dhivehi line for every English line", () => {
    expect(Object.keys(dv).sort()).toEqual(Object.keys(en).sort())
    for (const value of Object.values(dv)) expect(value).not.toBe("")
  })

  it("uses the bundled lines of the current locale", () => {
    render(<Line k="nothing_selected" />)
    expect(screen.getByTestId("line")).toHaveTextContent("Nothing Selected")
    act(() => setLocale("dv"))
    expect(screen.getByTestId("line")).toHaveTextContent(dv.nothing_selected)
  })

  it("replaces :placeholders", () => {
    render(<Line k="file_hint" replace={{ types: ".pdf", size: "2 MB" }} />)
    expect(screen.getByTestId("line")).toHaveTextContent("Only .pdf files of max 2 MB allowed.")
  })

  it("prefers lines the app loads from lang/vendor/forms", () => {
    // The shared translator keeps lines between tests, so this uses a line no other test reads.
    act(() => addLines({ "strings.apply": "ހިންގާ" }, "dv", "forms"))
    act(() => setLocale("dv"))
    render(<Line k="apply" />)
    expect(screen.getByTestId("line")).toHaveTextContent("ހިންގާ")
  })

  it("keeps the bundled Dhivehi line over the app's English fallback", () => {
    act(() => addLines({ "strings.blank": "(none)" }, "en", "forms"))
    act(() => setLocale("dv"))
    render(<Line k="blank" />)
    expect(screen.getByTestId("line")).toHaveTextContent(dv.blank)
  })

  it("falls back to English for other locales", () => {
    expect(bundledLine("yes", "fr")).toBe("Yes")
    expect(bundledLine("yes", "dv_MV")).toBe(dv.yes)
  })

  it("re-renders components on a locale change", () => {
    render(<Select2 name="city" options={{ 1: "Malé" }} />)
    expect(screen.getByRole("option", { name: "Nothing Selected" })).toBeInTheDocument()
    act(() => setLocale("dv"))
    expect(screen.getByRole("option", { name: dv.nothing_selected })).toBeInTheDocument()
  })
})

describe("generated labels", () => {
  it("go through __(), like Blade's trans()", () => {
    act(() => addLines({ "Company Name": "ކުންފުނީގެ ނަން" } as Record<string, string>, "dv"))
    act(() => setLocale("dv"))
    render(<Text name="company_name" />)
    expect(screen.getByLabelText("ކުންފުނީގެ ނަން")).toBeInTheDocument()
  })

  it("use FormsProvider translate when it is set", () => {
    render(
      <FormsProvider translate={(text) => `t:${text}`}>
        <Text name="title" />
      </FormsProvider>,
    )
    expect(screen.getByLabelText("t:Title")).toBeInTheDocument()
  })
})
