import { fireEvent, render, screen } from "@testing-library/react"

import { fd } from "../../../test/helpers"
import { Latitude } from "../../components/inputs"

describe("the HTML Number slot", () => {
  it("submits the rounded value after blur, and keeps the typed text while focused", () => {
    const { container } = render(
      <form>
        <Latitude name="lat" label="ލެޓިޓިއުޑް" />
      </form>,
    )
    const input = screen.getByLabelText("ލެޓިޓިއުޑް")
    fireEvent.change(input, { target: { value: "1.23456789" } })
    expect(input).toHaveValue(1.23456789)
    fireEvent.blur(input)
    expect(fd(container).get("lat")).toBe("1.234568")
  })
})
