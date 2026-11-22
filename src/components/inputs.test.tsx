import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import { fd } from "../../test/helpers"
import { Url } from "./inputs"

describe("Url", () => {
  it("reports the added https:// to a controlled parent", () => {
    const seen: string[] = []
    function Page() {
      const [v, setV] = React.useState("example.mv")
      return (
        <Url
          name="site"
          label="ވެބްސައިޓް"
          value={v}
          onChange={(e) => {
            seen.push(e.target.value)
            setV(e.target.value)
          }}
        />
      )
    }
    render(<Page />)
    fireEvent.blur(screen.getByLabelText("ވެބްސައިޓް"))
    expect(screen.getByLabelText("ވެބްސައިޓް")).toHaveValue("https://example.mv")
    expect(seen).toEqual(["https://example.mv"])
  })

  it("adds https:// to an uncontrolled value", () => {
    const { container } = render(
      <form>
        <Url name="site" default="example.mv" />
      </form>,
    )
    fireEvent.blur(screen.getByLabelText("Site"))
    expect(fd(container).get("site")).toBe("https://example.mv")
  })
})
